/* FOH Toolkit Prototype 1.9 — guided show setup + audited desk-specific stageboxes */
(function(){
  'use strict';

  const SQ_KEYS=new Set(['ah_sq5','ah_sq6','ah_sq7','ah_sqrack','ah_sq5plus','ah_sq6plus','ah_sq7plus','ah_sq','sq']);

  const BOXES={
    dx32:{label:'DX32',inputs:0,outputs:0,protocol:'DX / SLink',manual:true,countsLabel:'modular · up to 32 × 32',note:'DX32 uses four modular 8-channel I/O slots. Select it here, then patch the fitted cards manually.'},
    dx168:{label:'DX168',inputs:16,outputs:8,protocol:'DX / SLink'},
    ab168:{label:'AB168',inputs:16,outputs:8,protocol:'dSnake / SLink'},
    ar2412:{label:'AR2412',inputs:24,outputs:12,protocol:'dSnake / SLink'},
    gx4816:{label:'GX4816',inputs:48,outputs:16,protocol:'gigaACE / SLink'},
    ar84:{label:'AR84',inputs:8,outputs:4,protocol:'dSnake / SLink'},
    dx164w:{label:'DX164-W',inputs:16,outputs:4,protocol:'DX / SLink'},
    dx88p:{label:'DX88-P',inputs:8,outputs:8,protocol:'DX / SLink'},
    dx012:{label:'DX012',inputs:0,outputs:12,protocol:'DX / SLink'},

    s16:{label:'Behringer S16',inputs:16,outputs:8,protocol:'AES50'},
    sd16:{label:'Behringer SD16',inputs:16,outputs:8,protocol:'AES50'},
    sd8:{label:'Behringer SD8',inputs:8,outputs:8,protocol:'AES50'},
    s32:{label:'Behringer S32',inputs:32,outputs:16,protocol:'AES50'},
    dl8:{label:'Midas DL8',inputs:8,outputs:8,protocol:'AES50'},
    dl16:{label:'Midas DL16',inputs:16,outputs:8,protocol:'AES50'},
    dl32:{label:'Midas DL32',inputs:32,outputs:16,protocol:'AES50'},
    dl151:{label:'Midas DL151',inputs:24,outputs:0,protocol:'AES50 / PRO stage I/O'},
    dl152:{label:'Midas DL152',inputs:0,outputs:24,protocol:'AES50 / PRO stage I/O'},
    dl153:{label:'Midas DL153',inputs:16,outputs:8,protocol:'AES50 / PRO stage I/O'},
    dl154:{label:'Midas DL154',inputs:8,outputs:16,protocol:'AES50 / PRO stage I/O'},
    dl155:{label:'Midas DL155',inputs:16,outputs:16,protocol:'AES50 / PRO stage I/O',note:'DL155 is mixed analogue/AES I/O: 8 mic preamps plus 8 AES inputs, and 8 analogue line plus 8 AES outputs.'},
    dl231:{label:'Midas DL231',inputs:24,outputs:24,protocol:'AES50 / stage I/O'},
    dl251:{label:'Midas DL251',inputs:48,outputs:16,protocol:'AES50 / stage I/O'},
    dl252:{label:'Midas DL252',inputs:16,outputs:48,protocol:'AES50 / PRO stage I/O'},

    tio1608d:{label:'Yamaha Tio1608-D',inputs:16,outputs:8,protocol:'Dante'},
    tio1608d2:{label:'Yamaha Tio1608-D2',inputs:16,outputs:8,protocol:'Dante'},
    rio1608d:{label:'Yamaha Rio1608-D',inputs:16,outputs:8,protocol:'Dante'},
    rio3224d:{label:'Yamaha Rio3224-D',inputs:32,outputs:16,protocol:'Dante',note:'Automatic patch uses the 16 analogue line outputs; the Rio3224-D also provides AES outputs.'},
    rio1608d2:{label:'Yamaha Rio1608-D2',inputs:16,outputs:8,protocol:'Dante'},
    rio3224d2:{label:'Yamaha Rio3224-D2',inputs:32,outputs:16,protocol:'Dante',note:'Automatic patch uses the 16 analogue line outputs; additional AES outputs are left manual.'},
    rio1608d3:{label:'Yamaha Rio1608-D3',inputs:16,outputs:8,protocol:'Dante'},
    rio3224d3:{label:'Yamaha Rio3224-D3',inputs:32,outputs:16,protocol:'Dante',note:'Automatic patch uses the 16 analogue line outputs; additional digital I/O is left manual.'},
    rpio622:{label:'Yamaha RPio622',inputs:0,outputs:0,protocol:'TWINLANe',manual:true,countsLabel:'modular I/O rack',note:'RPio622 is modular. FOH Toolkit lists it as compatible RIVAGE I/O but leaves socket counts and patching manual.'},
    rpio222:{label:'Yamaha RPio222',inputs:0,outputs:0,protocol:'TWINLANe',manual:true,countsLabel:'modular I/O rack',note:'RPio222 is modular. FOH Toolkit lists it as compatible RIVAGE I/O but leaves socket counts and patching manual.'},

    sc16i:{label:'Soundcraft Mini Stagebox 16i',inputs:16,outputs:8,protocol:'MADI'},
    sc32i:{label:'Soundcraft Mini Stagebox 32i',inputs:32,outputs:12,protocol:'MADI'},
    sc16r:{label:'Soundcraft Mini Stagebox 16R',inputs:16,outputs:8,protocol:'MADI'},
    sc32r:{label:'Soundcraft Mini Stagebox 32R',inputs:32,outputs:8,protocol:'MADI',note:'Automatic patch uses the 8 analogue line outputs; the four AES output pairs stay manual.'},
    sccompact:{label:'Soundcraft Compact Stagebox',inputs:0,outputs:0,protocol:'MADI',manual:true,countsLabel:'configurable I/O',note:'Compact Stagebox cards can be configured several ways, so FOH Toolkit does not guess the fitted analogue/AES modules.'},
    scvistage:{label:'Soundcraft Vi Stagebox · standard 64/32',inputs:64,outputs:32,protocol:'MADI',note:'This is the standard 64 mic/line input / 32 analogue output build. Part-fitted and alternative-card Vi Stageboxes should be patched manually.'},

    drack96:{label:'DiGiCo D-Rack · 96 kHz Cat5',inputs:28,outputs:8,protocol:'DiGiCo Cat5 / MADI',note:'At 96 kHz over Cat5, D-Rack supports 28 mic inputs. Automatic outputs use the 8 standard line outputs; optional output modules stay manual.'},
    drack48:{label:'DiGiCo D-Rack · 48 kHz',inputs:32,outputs:8,protocol:'DiGiCo Cat5 / MADI',note:'At 48 kHz, D-Rack supports all 32 mic inputs. Automatic outputs use the 8 standard line outputs; optional output modules stay manual.'},
    d2rack:{label:'DiGiCo D2-Rack',inputs:48,outputs:16,protocol:'MADI',note:'Uses the standard 48-input / 16-output configuration; optional output expansion stays manual.'},
    mqrack:{label:'DiGiCo MQ-Rack',inputs:48,outputs:24,protocol:'MADI'},
    sdmini:{label:'DiGiCo SD-MiNi Rack',inputs:0,outputs:0,protocol:'MADI / Optocore',manual:true,countsLabel:'modular · up to 32 I/O',note:'SD-MiNi is modular, so FOH Toolkit leaves the fitted cards and socket count manual.'},

    avidstage48:{label:'Avid Stage 48',inputs:48,outputs:24,protocol:'VENUE stage network'},
    avidstage16:{label:'Avid Stage 16',inputs:16,outputs:8,protocol:'VENUE stage network',note:'Automatic patch uses the 8 analogue outputs. Stage 16 also provides 4 AES output channels.'},
    avidstage32:{label:'Avid Stage 32',inputs:0,outputs:0,protocol:'VENUE stage network',manual:true,countsLabel:'modular I/O rack',note:'Stage 32 is modular; its actual analogue/digital card count is configured per rack.'},
    avidstage64:{label:'Avid Stage 64',inputs:0,outputs:0,protocol:'VENUE stage network',manual:true,countsLabel:'modular I/O rack',note:'Stage 64 is modular; its actual analogue/digital card count is configured per rack.'},

    nsb168:{label:'PreSonus NSB 16.8',inputs:16,outputs:8,protocol:'AVB'},
    nsb88:{label:'PreSonus NSB 8.8',inputs:8,outputs:8,protocol:'AVB'},

    sslsb3224:{label:'SSL SB 32.24',inputs:32,outputs:16,protocol:'Dante',note:'Automatic patch uses the 32 analogue mic/line inputs and 16 analogue line outputs; AES I/O stays manual.'},
    sslsb1612:{label:'SSL SB 16.12',inputs:16,outputs:8,protocol:'Dante',note:'Automatic patch uses the 16 analogue mic/line inputs and 8 analogue line outputs; AES I/O stays manual.'},
    sslsb88:{label:'SSL SB 8.8',inputs:8,outputs:8,protocol:'Dante'},
    sslsbi16:{label:'SSL SBi16',inputs:16,outputs:0,protocol:'Dante'},

    tascamsb16d:{label:'TASCAM SB-16D',inputs:16,outputs:16,protocol:'Dante'},

    rolands2416:{label:'Roland S-2416',inputs:24,outputs:16,protocol:'REAC',note:'Automatic patch uses the analogue 24-in / 16-out section; AES I/O stays manual.'},
    rolands1608:{label:'Roland S-1608',inputs:16,outputs:8,protocol:'REAC'},
    rolands0816:{label:'Roland S-0816',inputs:8,outputs:16,protocol:'REAC'}
  };

  const LOCAL_IO={
    ah_sq5:{label:'SQ-5 local I/O',inputs:16,outputs:12,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq6:{label:'SQ-6 local I/O',inputs:24,outputs:14,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq7:{label:'SQ-7 local I/O',inputs:32,outputs:16,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sqrack:{label:'SQ-Rack local I/O',inputs:16,outputs:12,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq5plus:{label:'SQ5+ local I/O',inputs:16,outputs:12,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq6plus:{label:'SQ6+ local I/O',inputs:24,outputs:14,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq7plus:{label:'SQ7+ local I/O',inputs:32,outputs:16,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    ah_sq:{label:'SQ local I/O',inputs:16,outputs:12,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    sq:{label:'SQ local I/O',inputs:16,outputs:12,inputPrefix:'Local XLR',outputPrefix:'Local XLR'},
    yam_dm3:{label:'DM3 local I/O',inputs:16,outputs:8,inputPrefix:'Local Input',outputPrefix:'Local Output'},
    yam_dm3s:{label:'DM3 Standard local I/O',inputs:16,outputs:8,inputPrefix:'Local Input',outputPrefix:'Local Output'},
    yam_dm7:{label:'DM7 local I/O',inputs:32,outputs:16,inputPrefix:'Local Input',outputPrefix:'Local Output'},
    yam_dm7c:{label:'DM7 Compact local I/O',inputs:16,outputs:16,inputPrefix:'Local Input',outputPrefix:'Local Output'}
  };

  const SQ_BOXES=['gx4816','dx32','dx168','dx164w','dx88p','dx012','ar2412','ar84','ab168'];
  const AVANTIS_BOXES=['gx4816','dx32','dx168','dx164w','dx88p','dx012','ar2412','ar84','ab168'];
  const X32_BOXES=['s16','sd16','sd8','s32','dl8','dl16','dl32'];
  const HD96_BOXES=['dl151','dl152','dl153','dl154','dl155','dl231','dl251','dl252'];
  const YAMAHA_RIO_ALL=['rio3224d3','rio1608d3','rio3224d2','rio1608d2','rio3224d','rio1608d'];
  const YAMAHA_TIO=['tio1608d2','tio1608d'];

  function normalKey(key){return typeof normaliseConsoleKey==='function'?normaliseConsoleKey(key):String(key||'generic');}
  function boxWithPath(id,inputPrefix,outputPrefix,extra={}){
    const b=BOXES[id];if(!b)return null;
    return Object.assign({id,inputPrefix,outputPrefix},b,extra);
  }
  function boxList(ids,inputPrefix,outputPrefix,extra={}){return ids.map(id=>boxWithPath(id,inputPrefix,outputPrefix,extra)).filter(Boolean);}

  function catalogFor(consoleKey){
    const key=normalKey(consoleKey),local=LOCAL_IO[key]||null;
    if(SQ_KEYS.has(key))return {local,boxes:boxList(SQ_BOXES,'SLink','SLink'),busPrefix:'Mix',mains:['Main LR L','Main LR R'],note:'DX32 is listed as modular/manual because its fitted cards determine the real socket count.'};
    if(key==='ah_avantis')return {local:null,boxes:boxList(AVANTIS_BOXES,'SLink','SLink'),busPrefix:'Mix',mains:['Main L','Main R'],note:'Avantis SLink supports GX, DX and dSnake expanders. DX32 remains manual because its I/O cards are configurable.'};
    if(key==='ah_dlive')return {local:null,boxes:[
      boxWithPath('dx32','DX Input','DX Output'),
      boxWithPath('dx168','DX Input','DX Output'),
      boxWithPath('dx164w','DX Input','DX Output'),
      boxWithPath('dx88p','DX Input','DX Output'),
      boxWithPath('dx012','DX Input','DX Output'),
      boxWithPath('gx4816','I/O Port Input','I/O Port Output',{note:'Direct GX4816 use on dLive requires the appropriate gigaACE I/O connectivity and supported firmware.'})
    ].filter(Boolean),busPrefix:'Mix',mains:['Main L','Main R']};
    if(key==='ah_qu')return {local:null,boxes:boxList(['ar2412','ab168','ar84'],'dSnake Input','dSnake Output'),busPrefix:'Mix',mains:['Main L','Main R'],note:'FOH Toolkit currently uses one generic Qu profile. AR2412 / AB168 / AR84 are kept here because they are safe dSnake choices across the range. New Qu-5/6/7 models also support DX/GX, but those will be split into model-specific Qu profiles before automatic DX/GX defaults are enabled.'};

    if(key==='behr_x32'||key==='behr_wing')return {local:null,boxes:boxList(X32_BOXES,'AES50-A Input','AES50-A Output'),busPrefix:'Bus',mains:['Main L','Main R']};
    if(key==='midas_hd96')return {local:null,boxes:boxList(HD96_BOXES,'Stage I/O Input','Stage I/O Output'),busPrefix:'Bus',mains:['Main L','Main R'],note:'Heritage-D systems can use Midas PRO/DL stage I/O through the required AES50/HyperMAC infrastructure. Confirm the venue’s AS80/DN9680/network topology before relying on a direct-port assumption.'};

    if(key==='yam_dm3')return {local,boxes:boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R'],note:'DM3 Dante supports current Tio and Rio generations with compatible firmware.'};
    if(key==='yam_dm3s')return {local,boxes:[],busPrefix:'Mix',mains:['Stereo L','Stereo R'],note:'DM3 Standard has no Dante interface, so Dante stageboxes are not offered automatically.'};
    if(key==='yam_dm7'||key==='yam_dm7c')return {local,boxes:boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo A L','Stereo A R']};
    if(key==='yam_dm')return {local:null,boxes:boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R']};
    if(key==='yam_clql')return {local:null,boxes:boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R'],note:'Rio-D3 remote control requires current compatible CL/QL firmware.'};
    if(key==='yam_tf')return {local:null,boxes:boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output',{note:'TF network stage I/O requires the NY64-D Dante card and compatible console/rack firmware.'}),busPrefix:'Aux',mains:['Stereo L','Stereo R']};
    if(key==='yam_rivage')return {local:null,boxes:[
      ...boxList([...YAMAHA_TIO,...YAMAHA_RIO_ALL],'Dante Input','Dante Output'),
      boxWithPath('rpio622','TWINLANe Input','TWINLANe Output'),
      boxWithPath('rpio222','TWINLANe Input','TWINLANe Output')
    ].filter(Boolean),busPrefix:'Mix',mains:['Stereo L','Stereo R'],note:'RPio racks are RIVAGE’s modular TWINLANe I/O and therefore stay manual; Rio/Tio entries use Dante.'};

    if(key==='sc_si')return {local:null,boxes:boxList(['sc32i','sc16i','sc32r','sc16r','sccompact','scvistage'],'MADI Input','MADI Output'),busPrefix:'Mix',mains:['Main L','Main R'],note:'Compact Stagebox is configuration-dependent and stays manual. Vi Stagebox uses its standard 64/32 build for automatic patching.'};
    if(key==='sc_vi')return {local:null,boxes:boxList(['scvistage','sccompact','sc32i','sc16i','sc32r','sc16r'],'MADI Input','MADI Output'),busPrefix:'Aux',mains:['Main L','Main R'],note:'Compact Stagebox is configuration-dependent and stays manual.'};

    if(key==='digico_quantum'||key==='digico_sd'||key==='digico_s')return {local:null,boxes:boxList(['mqrack','d2rack','drack96','drack48','sdmini'],'Rack Input','Rack Output'),busPrefix:'Aux',mains:['Main L','Main R'],note:'D-Rack now has separate 96 kHz and 48 kHz entries because its available mic-input count changes with sample rate. Modular SD-MiNi stays manual.'};

    if(key==='avid_s6l')return {local:null,boxes:boxList(['avidstage48','avidstage16','avidstage32','avidstage64'],'Stage Input','Stage Output'),busPrefix:'Aux',mains:['Main L','Main R'],note:'Stage 32 and Stage 64 are modular and therefore stay manual. Stage 16 automatic outputs use its 8 analogue output sockets, not its additional AES channels.'};

    if(key==='presonus_s3')return {local:null,boxes:boxList(['nsb168','nsb88'],'AVB Input','AVB Output'),busPrefix:'Aux',mains:['Main L','Main R']};
    if(key==='ssl_live')return {local:null,boxes:boxList(['sslsb3224','sslsb1612','sslsb88','sslsbi16'],'Dante Input','Dante Output'),busPrefix:'Aux',mains:['Main L','Main R']};
    if(key==='tascam_sonicview')return {local:null,boxes:boxList(['tascamsb16d'],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Main L','Main R']};
    if(key==='roland_m5000')return {local:null,boxes:boxList(['rolands2416','rolands1608','rolands0816'],'REAC A Input','REAC A Output'),busPrefix:'Aux',mains:['Main L','Main R']};

    return {local:null,boxes:[],busPrefix:'Mix',mains:['Main L','Main R']};
  }

  let draft={step:0,name:'New Show',console:'generic',ioKey:'manual',pendingPreset:null};

  function loadCss(){
    if(document.getElementById('fohWizardCss'))return;
    const l=document.createElement('link');l.id='fohWizardCss';l.rel='stylesheet';l.href='upgrade-v8.css';document.head.appendChild(l);
  }
  function localFor(consoleKey){return catalogFor(consoleKey).local;}
  function ioProfile(consoleKey,ioKey){
    const c=catalogFor(consoleKey);
    if(ioKey==='local')return c.local?Object.assign({id:'local',protocol:'Local'},c.local):null;
    if(ioKey==='manual'||!ioKey)return null;
    return c.boxes.find(b=>b.id===ioKey)||null;
  }
  function defaultIoKey(consoleKey){return localFor(consoleKey)?'local':'manual';}
  function outputSourceFor(consoleKey,n,total){
    const c=catalogFor(consoleKey);
    if(n===total-1)return c.mains[0];
    if(n===total)return c.mains[1];
    return `${c.busPrefix||'Mix'} ${n}`;
  }
  function applyOutputDefaults(show){
    const p=ioProfile(show.console,show.stageboxProfile||'manual');
    show.outputs=[];
    if(!p||p.manual||!p.outputs)return;
    for(let n=1;n<=p.outputs;n++)show.outputs.push({source:outputSourceFor(show.console,n,p.outputs),dest:`${p.outputPrefix} ${n}`,customSource:'',customDest:''});
  }
  function autoPatchChannel(show,channel,index){
    if(!show||!channel)return;
    const p=ioProfile(show.console,show.stageboxProfile||'manual');
    if(!p)return;
    const n=index+1;
    show.io=show.io||{};
    show.io[channel.id]={...(show.io[channel.id]||{}),source:!p.manual&&n<=p.inputs?`${p.inputPrefix} ${n}`:'',channel:`Input CH ${n}`,customSource:''};
  }
  function addPresetToShow(show,preset){
    const ch={id:crypto.randomUUID(),presetId:preset.id,name:preset.name};
    show.channels.push(ch);autoPatchChannel(show,ch,show.channels.length-1);return ch;
  }

  function ensureWizard(){
    let d=document.getElementById('newShowWizard');if(d)return d;
    d=document.createElement('dialog');d.id='newShowWizard';d.className='sheet-dialog show-wizard-dialog';
    d.innerHTML='<div class="sheet-handle"></div><div id="showWizardBody"></div><button class="icon-button close-sheet" id="closeShowWizard" aria-label="Close">×</button>';
    document.body.appendChild(d);
    d.querySelector('#closeShowWizard').addEventListener('click',()=>d.close());
    d.addEventListener('click',e=>{if(e.target===d)d.close();});
    d.addEventListener('change',handleWizardChange);d.addEventListener('click',handleWizardClick);return d;
  }
  function deskOptions(selected){return typeof consoleOptionsHTML==='function'?consoleOptionsHTML(selected):`<option value="${esc(selected)}">${esc(selected)}</option>`;}
  function hardwareOptionLabel(p){
    if(p.manual)return `${p.label} · ${p.countsLabel||'configuration-dependent'} · manual patch`;
    return `${p.label} · ${p.inputs} in / ${p.outputs} out · ${p.protocol}`;
  }
  function hardwareOptions(){
    const c=catalogFor(draft.console),entries=[];
    if(c.local){
      const p=c.local;entries.push(`<option value="local" ${draft.ioKey==='local'?'selected':''}>${esc(p.label)} · ${p.inputs} in / ${p.outputs} out</option>`);
    }else{
      entries.push(`<option value="manual" ${draft.ioKey==='manual'?'selected':''}>Console local I/O / manual patch</option>`);
    }
    c.boxes.forEach(p=>entries.push(`<option value="${p.id}" ${draft.ioKey===p.id?'selected':''}>${esc(hardwareOptionLabel(p))}</option>`));
    return entries.join('');
  }
  function hardwareSummary(){
    const c=catalogFor(draft.console),p=ioProfile(draft.console,draft.ioKey);
    if(!p){
      const msg=c.boxes.length?'Local I/O varies by console model, so FOH Toolkit will leave the local patch manual. Choose a fixed-I/O stagebox above for automatic one-to-one patching.':'No verified remote stagebox profile is mapped for this desk yet. The show can still use local/manual I/O.';
      return `<div class="wizard-summary"><strong>Manual local patch</strong><span>${esc(msg)}</span>${c.note?`<span>${esc(c.note)}</span>`:''}</div>`;
    }
    if(p.manual){
      return `<div class="wizard-summary"><strong>${esc(p.label)}</strong><span>Compatible hardware, but its fitted I/O is configuration-dependent. FOH Toolkit will create the show and leave channel/output patching manual.</span>${p.note?`<span>${esc(p.note)}</span>`:''}${c.note?`<span>${esc(c.note)}</span>`:''}</div>`;
    }
    const inputs=p.inputs?`CH 1 → ${p.inputPrefix} 1, CH 2 → ${p.inputPrefix} 2 … up to CH ${p.inputs}.`:'This device is output-only, so channel inputs stay unpatched.';
    let outputs='No physical outputs available.';
    if(p.outputs>=2){
      const count=p.outputs-2;
      outputs=`Outputs 1–${count} are assigned to ${catalogFor(draft.console).busPrefix||'Mix'} 1–${count}. ${catalogFor(draft.console).mains[0]} → ${p.outputPrefix} ${p.outputs-1}; ${catalogFor(draft.console).mains[1]} → ${p.outputPrefix} ${p.outputs}.`;
    }
    return `<div class="wizard-summary"><strong>${esc(p.label)}</strong><span>${esc(inputs)}</span><span>${esc(outputs)}</span>${p.note?`<span>${esc(p.note)}</span>`:''}${c.note?`<span>${esc(c.note)}</span>`:''}</div>`;
  }
  function progressHTML(){return `<div class="wizard-progress" aria-label="Step ${draft.step+1} of 3"><span class="${draft.step>=0?'active':''}"></span><span class="${draft.step>=1?'active':''}"></span><span class="${draft.step>=2?'active':''}"></span></div>`;}
  function renderWizard(){
    const body=document.getElementById('showWizardBody');if(!body)return;
    let content='';
    if(draft.step===0){
      content=`<span class="eyebrow">NEW SHOW · 1 OF 3</span><h2>What are we building?</h2><p class="wizard-copy">Give the show a name. You can rename it later.</p><label class="wizard-field"><span>Show name</span><input id="wizardShowName" value="${esc(draft.name)}" maxlength="80" autocomplete="off" /></label>`;
    }else if(draft.step===1){
      const profile=typeof getDeskProfile==='function'?getDeskProfile(normalKey(draft.console)):null;
      content=`<span class="eyebrow">NEW SHOW · 2 OF 3</span><h2>Select the console</h2><p class="wizard-copy">The show will use this desk for preset translation, I/O choices and native export where supported.</p><label class="wizard-field"><span>Console</span><select id="wizardConsole">${deskOptions(normalKey(draft.console))}</select></label>${profile?`<div class="wizard-summary compact"><strong>${esc(profile.name)}</strong><span>${esc(profile.family||'FOH Toolkit console profile')}</span></div>`:''}`;
    }else{
      const c=catalogFor(draft.console),hasBoxes=c.boxes.length>0;
      content=`<span class="eyebrow">NEW SHOW · 3 OF 3</span><h2>${hasBoxes?'Choose stagebox / local I/O':'Choose I/O starting point'}</h2><p class="wizard-copy">${hasBoxes?'FOH Toolkit filters the I/O list for this desk. Fixed-I/O stageboxes can build a one-to-one input patch and sensible output default; modular racks are clearly marked manual.':'This console can still use the show builder with local/manual I/O.'}</p><label class="wizard-field"><span>I/O hardware</span><select id="wizardHardware">${hardwareOptions()}</select></label>${hardwareSummary()}`;
    }
    body.innerHTML=`${progressHTML()}<div class="wizard-content">${content}</div><div class="wizard-actions">${draft.step?'<button class="secondary" id="wizardBack">‹ Back</button>':''}<button class="primary" id="wizardNext">${draft.step===2?'Create show':'Next ›'}</button></div>`;
    if(draft.step===0)setTimeout(()=>document.getElementById('wizardShowName')?.focus(),20);
  }
  function openWizard(preset){
    const console=normalKey(state.console||localStorage.getItem('fohConsole')||'generic');
    draft={step:0,name:'New Show',console,ioKey:defaultIoKey(console),pendingPreset:preset||null};
    const d=ensureWizard();renderWizard();if(!d.open)d.showModal();d.scrollTop=0;
  }
  function handleWizardChange(e){
    if(e.target?.id==='wizardShowName')draft.name=e.target.value;
    if(e.target?.id==='wizardConsole'){draft.console=normalKey(e.target.value);draft.ioKey=defaultIoKey(draft.console);renderWizard();}
    if(e.target?.id==='wizardHardware'){draft.ioKey=e.target.value;renderWizard();}
  }
  function createShowFromWizard(){
    const name=(document.getElementById('wizardShowName')?.value||draft.name||'New Show').trim();
    if(!name){toast('Give the show a name first');draft.step=0;renderWizard();return;}
    draft.name=name;
    const consoleKey=normalKey(draft.console);
    const show={id:crypto.randomUUID(),name,console:consoleKey,channels:[],io:{},outputs:[],softKeys:[],stageboxProfile:draft.ioKey||'manual'};
    applyOutputDefaults(show);
    if(draft.pendingPreset)addPresetToShow(show,draft.pendingPreset);
    state.shows.push(show);persist();renderShows();document.getElementById('newShowWizard')?.close();
    const pd=document.getElementById('presetDialog');if(pd?.open)pd.close();
    toast(`${show.name} created · ${typeof getDeskProfile==='function'?getDeskProfile(show.console).name:show.console}`);setTimeout(()=>openShow(show.id),0);
  }
  function handleWizardClick(e){
    if(e.target?.id==='wizardBack'){draft.step=Math.max(0,draft.step-1);renderWizard();return;}
    if(e.target?.id!=='wizardNext')return;
    if(draft.step===0){const input=document.getElementById('wizardShowName');draft.name=(input?.value||'').trim();if(!draft.name){toast('Give the show a name first');input?.focus();return;}}
    if(draft.step<2){draft.step++;renderWizard();return;}createShowFromWizard();
  }

  bindShows=function(){document.getElementById('newShowBtn')?.addEventListener('click',()=>openWizard());};

  const oldChooseShowForPreset=chooseShowForPreset;
  chooseShowForPreset=function(p){
    ensureShowDefaults();
    if(!state.shows.length){openWizard(p);return;}
    const before=new Map(state.shows.map(s=>[s.id,new Set(s.channels.map(c=>c.id))]));
    oldChooseShowForPreset(p);
    for(const show of state.shows){
      const known=before.get(show.id)||new Set(),idx=show.channels.findIndex(c=>!known.has(c.id));
      if(idx<0)continue;autoPatchChannel(show,show.channels[idx],idx);persist();break;
    }
  };

  const oldShowChannelsPane=showChannelsPane;
  showChannelsPane=function(show){
    const html=oldShowChannelsPane(show),marker='<div class="show-pane active" data-show-pane="channels">';
    if(!html.includes(marker))return html;
    const p=ioProfile(show.console,show.stageboxProfile||'manual');
    const sub=p?(p.manual?`${p.label} selected · patch manually.`:`Inputs follow ${p.label} automatically.`):'Local/manual I/O selected.';
    const action=`<div class="show-build-actions"><button class="primary" id="browsePresetsForShow">＋ Add channels from presets</button><span>${esc(sub)}</span></div>`;
    return html.replace(marker,marker+action);
  };

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('#browsePresetsForShow'))return;
    const d=document.getElementById('showDialog');if(d?.open)d.close();switchScreen('presets');toast('Choose a preset, then tap Add to a show');
  });

  function installNewShowButton(){
    const old=document.getElementById('newShowBtn');if(!old)return;
    const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',()=>openWizard());
  }
  function ready(){
    loadCss();ensureWizard();installNewShowButton();
    setTimeout(()=>{const v=document.getElementById('versionText');if(v)v.textContent='Prototype 1.9.0';},0);
  }

  loadCss();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else ready();
})();
