/* FOH Toolkit Prototype 1.3 — Allen & Heath SQ native export beta */
(function(){
  'use strict';

  const SQ_KEYS = new Set(['ah_sq5','ah_sq6','ah_sq7','ah_sq','sq']);
  const SQ_IMAGE_LEN = 131072;
  const SQ_STRIP_BASE = 0x374;
  const SQ_STRIP_STRIDE = 336;
  const SQ_NAME_LEN = 13; // observed SQ show field; bytes +0x0D..+0x0F are flags, not name bytes
  const SQ_SCENE_NAME_OFFSET = 0x14;
  const SQ_SCENE_NAME_LEN = 16;
  const SQ_SENTINELS = [
    [0x38,0x01],[0x370,0x02],[0xA394,0x03],[0xA698,0x04],[0xA99C,0x05],[0x13898,0x06],[0x13D88,0x07],
    [0x1445C,0x08],[0x14474,0x09],[0x14498,0x0A],[0x14A5C,0x0B],[0x14A78,0x0C],[0x15568,0x0D],[0x15F2C,0x0E]
  ];
  const encoder = new TextEncoder();
  let activeShowId = null;
  let templateCache = null;

  const zipCrcTable = new Uint32Array(256);
  const ahCrcTable = new Uint32Array(256);
  for(let i=0;i<256;i++){
    let c=i;
    for(let k=0;k<8;k++) c=(c&1)?((c>>>1)^0xEDB88320):(c>>>1);
    zipCrcTable[i]=c>>>0;
    ahCrcTable[i]=c>>>0;
  }

  function standardCrc32(bytes){
    let crc=0xFFFFFFFF;
    for(const b of bytes) crc=zipCrcTable[(crc^b)&0xFF]^(crc>>>8);
    return (crc^0xFFFFFFFF)>>>0;
  }

  function ahCrc32(bytes){
    let crc=0;
    for(const b of bytes){
      const idx=(~(crc^b))&0xFF;
      crc=(ahCrcTable[idx]^((crc>>>8)|0xFF000000))>>>0;
    }
    return crc>>>0;
  }

  function readU16(v,o){return v.getUint16(o,true);}
  function readU32(v,o){return v.getUint32(o,true);}
  function writeU16(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;}
  function writeU32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255;}

  function basename(path){return String(path||'').replace(/\\/g,'/').split('/').filter(Boolean).pop()||'';}
  function dirname(path){const p=String(path||'').replace(/\\/g,'/');const i=p.lastIndexOf('/');return i<0?'':p.slice(0,i+1);}
  function safeName(s){return String(s||'show').replace(/[^a-z0-9-_]+/gi,'_').replace(/^_+|_+$/g,'')||'show';}
  function usbShowPath(path){const p=String(path||'').replace(/\\/g,'/'),parts=p.split('/').filter(Boolean),existing=parts.findIndex(x=>/^AHSQ$/i.test(x));if(existing>=0&&/^SHOWS$/i.test(parts[existing+1]||'')&&/^SHOW\d{4}$/i.test(parts[existing+2]||''))return ['AHSQ','SHOWS',parts[existing+2].toUpperCase(),basename(p)].join('/');const showDir=parts.find(x=>/^SHOW\d{4}$/i.test(x));return `AHSQ/SHOWS/${(showDir||'SHOW0000').toUpperCase()}/${basename(p)}`;}

  async function inflateRaw(bytes){
    if(typeof DecompressionStream==='undefined') throw new Error('This browser cannot unpack a compressed SQ template. Try exporting the template as an uncompressed ZIP or use a newer browser.');
    let ds;
    try{ ds=new DecompressionStream('deflate-raw'); }
    catch(e){ throw new Error('This browser does not support raw ZIP decompression. Please update the browser before testing SQ export.'); }
    const stream=new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function unzip(arrayBuffer){
    const bytes=new Uint8Array(arrayBuffer), view=new DataView(arrayBuffer);
    let eocd=-1;
    const min=Math.max(0,bytes.length-0x10000-22);
    for(let i=bytes.length-22;i>=min;i--){
      if(bytes[i]===0x50&&bytes[i+1]===0x4b&&bytes[i+2]===0x05&&bytes[i+3]===0x06){eocd=i;break;}
    }
    if(eocd<0) throw new Error('Not a readable ZIP file.');
    const entries=readU16(view,eocd+10), cdOffset=readU32(view,eocd+16);
    let p=cdOffset; const out=[];
    for(let n=0;n<entries;n++){
      if(readU32(view,p)!==0x02014b50) throw new Error('ZIP central directory is invalid.');
      const method=readU16(view,p+10), crc=readU32(view,p+16), compSize=readU32(view,p+20), size=readU32(view,p+24);
      const nameLen=readU16(view,p+28), extraLen=readU16(view,p+30), commentLen=readU16(view,p+32), local=readU32(view,p+42);
      const name=new TextDecoder().decode(bytes.slice(p+46,p+46+nameLen));
      p+=46+nameLen+extraLen+commentLen;
      if(name.endsWith('/')) continue;
      if(readU32(view,local)!==0x04034b50) throw new Error(`ZIP entry ${name} has an invalid local header.`);
      const localNameLen=readU16(view,local+26), localExtraLen=readU16(view,local+28), dataStart=local+30+localNameLen+localExtraLen;
      const packed=bytes.slice(dataStart,dataStart+compSize);
      let data;
      if(method===0) data=packed;
      else if(method===8) data=await inflateRaw(packed);
      else throw new Error(`ZIP compression method ${method} is not supported.`);
      if(data.length!==size) throw new Error(`ZIP entry ${name} did not unpack to the expected size.`);
      if(standardCrc32(data)!==crc) throw new Error(`ZIP entry ${name} failed its ZIP checksum.`);
      out.push({name,data});
    }
    return out;
  }

  function zipStored(entries){
    const locals=[], centrals=[]; let offset=0;
    for(const entry of entries){
      const nameBytes=encoder.encode(entry.name), data=entry.data instanceof Uint8Array?entry.data:new Uint8Array(entry.data), crc=standardCrc32(data);
      const local=new Uint8Array(30+nameBytes.length+data.length);
      writeU32(local,0,0x04034b50);writeU16(local,4,20);writeU16(local,6,0x0800);writeU16(local,8,0);writeU16(local,10,0);writeU16(local,12,0);
      writeU32(local,14,crc);writeU32(local,18,data.length);writeU32(local,22,data.length);writeU16(local,26,nameBytes.length);writeU16(local,28,0);
      local.set(nameBytes,30);local.set(data,30+nameBytes.length);locals.push(local);
      const central=new Uint8Array(46+nameBytes.length);
      writeU32(central,0,0x02014b50);writeU16(central,4,20);writeU16(central,6,20);writeU16(central,8,0x0800);writeU16(central,10,0);writeU16(central,12,0);writeU16(central,14,0);
      writeU32(central,16,crc);writeU32(central,20,data.length);writeU32(central,24,data.length);writeU16(central,28,nameBytes.length);writeU16(central,30,0);writeU16(central,32,0);writeU16(central,34,0);writeU16(central,36,0);writeU32(central,38,0);writeU32(central,42,offset);central.set(nameBytes,46);centrals.push(central);
      offset+=local.length;
    }
    const cdSize=centrals.reduce((a,b)=>a+b.length,0), total=offset+cdSize+22, out=new Uint8Array(total);let p=0;
    for(const x of locals){out.set(x,p);p+=x.length;}const cdOffset=p;for(const x of centrals){out.set(x,p);p+=x.length;}
    writeU32(out,p,0x06054b50);writeU16(out,p+4,0);writeU16(out,p+6,0);writeU16(out,p+8,entries.length);writeU16(out,p+10,entries.length);writeU32(out,p+12,cdSize);writeU32(out,p+16,cdOffset);writeU16(out,p+20,0);
    return out;
  }

  function validateSqImage(data){
    if(!(data instanceof Uint8Array)||data.length!==SQ_IMAGE_LEN) return false;
    if(data[1]!==0x00||data[2]!==0xFE||data[3]!==0xFF) return false;
    if(data[0]!==0xA1&&data[0]!==0xB5) return false;
    for(const [off,id] of SQ_SENTINELS){if(data[off]!==id||data[off+1]!==0xA5||data[off+2]!==0xA5||data[off+3]!==0xA5)return false;}
    return true;
  }

  function checkAhChecksum(data){
    if(!validateSqImage(data)) return false;
    const view=new DataView(data.buffer,data.byteOffset,data.byteLength);
    return ahCrc32(data.slice(0x14,0x1FFFC))===view.getUint32(0x1FFFC,true);
  }

  function fixAhChecksum(data){
    const crc=ahCrc32(data.slice(0x14,0x1FFFC));
    writeU32(data,0x1FFFC,crc);
  }

  function writeAsciiField(data,offset,length,text,forceNull=true){
    const raw=encoder.encode(String(text||'').replace(/[^\x20-\x7E]/g,''));
    data.fill(0,offset,offset+length);
    const max=forceNull?Math.max(0,length-1):length;
    data.set(raw.slice(0,max),offset);
  }

  function writeShowName(data,name){
    data.fill(0);
    data.set(encoder.encode(String(name||'FOH Toolkit').replace(/[^\x20-\x7E]/g,'')).slice(0,511),0);
  }

  function stripOffset(channelNumber){return SQ_STRIP_BASE+(channelNumber-1)*SQ_STRIP_STRIDE;}

  function writeChannelName(image,ch,name){
    if(ch<1||ch>48) return;
    writeAsciiField(image,stripOffset(ch),SQ_NAME_LEN,name,true);
  }

  function parseInputChannel(text,fallback){
    const m=String(text||'').match(/(?:Input\s*CH|CH)\s*(\d+)/i);
    const n=m?Number(m[1]):fallback;
    return Number.isFinite(n)&&n>=1&&n<=48?n:null;
  }

  function parseSqSource(io){
    let s=String(io?.source||'').trim();
    if(s==='__custom__') s=String(io?.customSource||'').trim();
    let m=s.match(/^Local(?: XLR| Input)?\s*(\d+)$/i); if(m)return {classId:1,index:Number(m[1])};
    m=s.match(/^SLink(?: Input)?\s*(\d+)$/i); if(m)return {classId:2,index:Number(m[1])};
    m=s.match(/^USB(?: Input)?\s*(\d+)$/i); if(m)return {classId:3,index:Number(m[1])};
    m=s.match(/^I\/?O Port(?: Input)?\s*(\d+)$/i); if(m)return {classId:4,index:Number(m[1])};
    const stereo={ 'ST1 L':49,'ST1 R':50,'ST2 L':51,'ST2 R':52,'ST3 L':53,'ST3 R':54 };
    if(stereo[s]) return {classId:1,index:stereo[s]};
    return null;
  }

  function writeSqInputPatch(image,ch,source){
    if(ch<1||ch>48||!source||source.index<1||source.index>256) return false;
    const off=stripOffset(ch)+0x18;
    image[off]=(source.index-1)&0xFF;
    image[off+2]=source.classId&0xFF;
    return true;
  }

  function writeSceneName(image,name){
    if(image[0]!==0xA1)return;
    writeAsciiField(image,SQ_SCENE_NAME_OFFSET,SQ_SCENE_NAME_LEN,name,true);
  }

  function applyShowToSqImage(image,show,isScene){
    const mapped=[];
    for(let i=0;i<show.channels.length;i++){
      const c=show.channels[i],io=show.io?.[c.id]||{},ch=parseInputChannel(io.channel,i+1);
      if(!ch) continue;
      writeChannelName(image,ch,c.name||`CH ${ch}`);
      const source=parseSqSource(io);
      if(source&&writeSqInputPatch(image,ch,source)) mapped.push({ch,source:io.source||io.customSource||''});
    }
    if(isScene) writeSceneName(image,String(show.name||'FOH Toolkit').slice(0,15));
    fixAhChecksum(image);
    return mapped;
  }

  async function loadTemplate(file){
    const entries=await unzip(await file.arrayBuffer());
    const dat=entries.filter(e=>/\.DAT$/i.test(e.name));
    const show=dat.find(e=>basename(e.name).toUpperCase()==='SHOW.DAT');
    const nv=dat.find(e=>basename(e.name).toUpperCase()==='NVDATA.DAT');
    if(!show||!nv) throw new Error('That ZIP does not contain SHOW.DAT and NVDATA.DAT from an SQ show.');
    if(!validateSqImage(nv.data)||!checkAhChecksum(nv.data)) throw new Error('NVDATA.DAT is not a validated SQ show image or its checksum is invalid.');
    const scenes=dat.filter(e=>/^SCENE\d+\.DAT$/i.test(basename(e.name)));
    for(const sc of scenes){if(!validateSqImage(sc.data)||!checkAhChecksum(sc.data))throw new Error(`${basename(sc.name)} failed SQ validation.`);}
    templateCache={fileName:file.name,entries:dat.map(e=>({name:e.name,data:new Uint8Array(e.data)})),loadedAt:Date.now(),sceneCount:scenes.length};
    return templateCache;
  }

  function buildSqExport(show){
    if(!templateCache) throw new Error('Load a clean SQ template ZIP first.');
    const entries=templateCache.entries
      .map(e=>({name:usbShowPath(e.name),data:new Uint8Array(e.data)}));
    let changedImages=0,patches=0,names=0;
    for(const entry of entries){
      const base=basename(entry.name).toUpperCase();
      if(base==='SHOW.DAT'){writeShowName(entry.data,show.name);continue;}
      if(base==='NVDATA.DAT'||/^SCENE\d+\.DAT$/.test(base)){
        if(!validateSqImage(entry.data))continue;
        const isScene=base.startsWith('SCENE');
        const mapped=applyShowToSqImage(entry.data,show,isScene);
        patches+=mapped.length; names+=show.channels.length; changedImages++;
      }
    }
    if(!changedImages) throw new Error('No SQ mixer-state image was found in the template.');
    return {bytes:zipStored(entries),patches,names,images:changedImages};
  }

  function downloadBytes(bytes,name,type='application/zip'){
    const blob=new Blob([bytes],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function isSqShow(show){return !!show&&SQ_KEYS.has(String(show.console||''));}

  function sqPanelHTML(show){
    const loaded=templateCache?`<strong>Template loaded:</strong> ${esc(templateCache.fileName)} · ${templateCache.sceneCount} scene${templateCache.sceneCount===1?'':'s'}`:'No SQ template loaded yet.';
    return `<div class="panel export-panel sq-native-beta" id="sqNativeExportPanel">
      <span class="eyebrow">ALLEN &amp; HEATH SQ-5 / SQ-6 / SQ-7 · NATIVE EXPORT BETA</span>
      <h3>SQ show test export</h3>
      <p>This first native-export test writes the show name, input-channel names and supported input patching into a real SQ show image, recalculates the Allen &amp; Heath checksum and packages it under AHSQ/SHOWS for USB/MixPad testing. It intentionally does <strong>not</strong> claim processing, output patch, DCA/mute assignments or SoftKeys yet.</p>
      <div class="programming-status"><strong>TEST IN MIXPAD FIRST</strong><span>Do not rely on this file for a live show until the generated ZIP has opened correctly in SQ MixPad and the programmed values have been checked.</span></div>
      <label class="sq-template-picker"><span>1. Load a clean SQ show ZIP</span><input type="file" id="sqTemplateInput" accept=".zip,application/zip" /></label>
      <div class="helper" id="sqTemplateStatus">${loaded}</div>
      <button class="primary full" id="sqNativeExportBtn" ${templateCache?'':'disabled'}>2. Build SQ native test ZIP</button>
      <p class="helper">The template stays in this browser session only. FOH Toolkit does not upload it anywhere.</p>
    </div>`;
  }

  function enhanceShow(){
    const detail=document.getElementById('showDetail');
    if(!detail||!activeShowId)return;
    const show=state.shows?.find(s=>s.id===activeShowId);
    if(!isSqShow(show))return;
    const exportPanel=detail.querySelector('.export-panel');
    if(!exportPanel||detail.querySelector('#sqNativeExportPanel'))return;
    const p=exportPanel.querySelector('p');if(p)p.textContent='This JSON package remains useful as a FOH Toolkit backup. The SQ native test exporter is available below for classic SQ-5 / SQ-6 / SQ-7 shows.';
    exportPanel.insertAdjacentHTML('afterend',sqPanelHTML(show));
  }

  const previousOpenShow=window.openShow;
  if(typeof previousOpenShow==='function'){
    window.openShow=function(id){activeShowId=id;const r=previousOpenShow(id);setTimeout(enhanceShow,0);return r;};
  }

  document.addEventListener('change',async e=>{
    if(e.target?.id!=='sqTemplateInput')return;
    const file=e.target.files?.[0],status=document.getElementById('sqTemplateStatus'),btn=document.getElementById('sqNativeExportBtn');
    if(!file)return;
    if(status)status.textContent='Checking SQ template…';
    try{
      const t=await loadTemplate(file);
      if(status)status.innerHTML=`<strong>Template validated:</strong> ${esc(t.fileName)} · ${t.sceneCount} scene${t.sceneCount===1?'':'s'}`;
      if(btn)btn.disabled=false;
      if(typeof toast==='function')toast('SQ template validated');
    }catch(err){
      templateCache=null;if(btn)btn.disabled=true;if(status)status.textContent=err.message||String(err);if(typeof toast==='function')toast('SQ template could not be loaded');
    }
  });

  document.addEventListener('click',e=>{
    if(e.target?.id!=='sqNativeExportBtn')return;
    e.preventDefault();
    const show=state.shows?.find(s=>s.id===activeShowId);if(!show)return;
    try{
      const result=buildSqExport(show);
      downloadBytes(result.bytes,`${safeName(show.name)}_SQ_NATIVE_BETA.zip`);
      if(typeof toast==='function')toast(`SQ test ZIP built · ${result.patches} input patches written`);
    }catch(err){
      alert(`SQ export could not be built:\n\n${err.message||err}`);
    }
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const v=document.getElementById('versionText');if(v)v.textContent='Prototype 1.3.0';
    const detail=document.getElementById('showDetail');
    if(detail)new MutationObserver(()=>setTimeout(enhanceShow,0)).observe(detail,{childList:true,subtree:false});
  });
})();
