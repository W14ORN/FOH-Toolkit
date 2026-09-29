/* FOH Toolkit Prototype 1.7 — guided show setup + desk-specific stageboxes */
(function(){
  'use strict';

  const SQ_KEYS=new Set(['ah_sq5','ah_sq6','ah_sq7','ah_sqrack','ah_sq5plus','ah_sq6plus','ah_sq7plus','ah_sq','sq']);

  const BOXES={
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
    dl16:{label:'Midas DL16',inputs:16,outputs:8,protocol:'AES50'},
    dl32:{label:'Midas DL32',inputs:32,outputs:16,protocol:'AES50'},
    dl231:{label:'Midas DL231',inputs:24,outputs:24,protocol:'AES50 / stage I/O'},
    dl251:{label:'Midas DL251',inputs:48,outputs:16,protocol:'AES50 / stage I/O'},

    tio1608d2:{label:'Yamaha Tio1608-D2',inputs:16,outputs:8,protocol:'Dante'},
    rio1608d2:{label:'Yamaha Rio1608-D2',inputs:16,outputs:8,protocol:'Dante'},
    rio3224d2:{label:'Yamaha Rio3224-D2',inputs:32,outputs:16,protocol:'Dante'},
    rio1608d3:{label:'Yamaha Rio1608-D3',inputs:16,outputs:8,protocol:'Dante'},
    rio3224d3:{label:'Yamaha Rio3224-D3',inputs:32,outputs:16,protocol:'Dante'},

    sc16i:{label:'Soundcraft Mini Stagebox 16i',inputs:16,outputs:8,protocol:'MADI'},
    sc32i:{label:'Soundcraft Mini Stagebox 32i',inputs:32,outputs:12,protocol:'MADI'},
    sc16r:{label:'Soundcraft Mini Stagebox 16R',inputs:16,outputs:8,protocol:'MADI'},
    sc32r:{label:'Soundcraft Mini Stagebox 32R',inputs:32,outputs:8,protocol:'MADI',note:'8 analogue line outputs; additional AES outputs are not auto-patched here.'},
    scvistage:{label:'Soundcraft Vi Stagebox',inputs:64,outputs:32,protocol:'MADI'},

    drack:{label:'DiGiCo D-Rack',inputs:32,outputs:8,protocol:'MADI / rack port',note:'Uses the standard 32-in / 8 analogue-out configuration; optional output expansion is left manual.'},
    d2rack:{label:'DiGiCo D2-Rack',inputs:48,outputs:16,protocol:'MADI'},
    mqrack:{label:'DiGiCo MQ-Rack',inputs:48,outputs:24,protocol:'MADI'},

    avidstage48:{label:'Avid Stage 48',inputs:48,outputs:24,protocol:'VENUE stage network'},
    avidstage16:{label:'Avid Stage 16',inputs:16,outputs:12,protocol:'VENUE stage network'},

    nsb168:{label:'PreSonus NSB 16.8',inputs:16,outputs:8,protocol:'AVB'},
    nsb88:{label:'PreSonus NSB 8.8',inputs:8,outputs:8,protocol:'AVB'},

    sslsb3224:{label:'SSL SB 32.24',inputs:32,outputs:16,protocol:'Dante',note:'Automatic patch uses the 32 analogue mic/line inputs and 16 analogue line outputs.'},
    sslsb1612:{label:'SSL SB 16.12',inputs:16,outputs:8,protocol:'Dante',note:'Automatic patch uses the 16 analogue mic/line inputs and 8 analogue line outputs.'},

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

  const SQ_BOXES=['dx168','ab168','ar2412','gx4816','ar84','dx164w','dx88p','dx012'];
  const AH_DX_BOXES=['dx168','gx4816','dx164w','dx88p','dx012'];
  const X32_BOXES=['s16','sd16','sd8','s32','dl16','dl32'];
  const YAMAHA_RIO=['rio3224d3','rio1608d3','rio3224d2','rio1608d2'];

  function normalKey(key){return typeof normaliseConsoleKey==='function'?normaliseConsoleKey(key):String(key||'generic');}
  function boxWithPath(id,inputPrefix,outputPrefix,extra={}){
    const b=BOXES[id];if(!b)return null;
    return Object.assign({id,inputPrefix,outputPrefix},b,extra);
  }
  function boxList(ids,inputPrefix,outputPrefix,extra={}){return ids.map(id=>boxWithPath(id,inputPrefix,outputPrefix,extra)).filter(Boolean);}

  function catalogFor(consoleKey){
    const key=normalKey(consoleKey),local=LOCAL_IO[key]||null;
    if(SQ_KEYS.has(key))return {local,boxes:boxList(SQ_BOXES,'SLink','SLink'),busPrefix:'Mix',mains:['Main LR L','Main LR R']};
    if(key==='ah_avantis')return {local:null,boxes:boxList(AH_DX_BOXES,'SLink','SLink'),busPrefix:'Mix',mains:['Main L','Main R']};
    if(key==='ah_dlive')return {local:null,boxes:[
      boxWithPath('dx168','DX Input','DX Output'),boxWithPath('gx4816','I/O Port Input','I/O Port Output'),boxWithPath('dx164w','DX Input','DX Output'),boxWithPath('dx88p','DX Input','DX Output'),boxWithPath('dx012','DX Input','DX Output')
    ].filter(Boolean),busPrefix:'Mix',mains:['Main L','Main R']};
    if(key==='ah_qu')return {local:null,boxes:boxList(['ar2412','ab168','ar84'],'dSnake Input','dSnake Output'),busPrefix:'Mix',mains:['Main L','Main R'],note:'DX/GX expanders depend on the exact 96 kHz Qu model, so this generic Qu profile lists the widely used dSnake boxes only.'};

    if(key==='behr_x32'||key==='behr_wing')return {local:null,boxes:boxList(X32_BOXES,'AES50-A Input','AES50-A Output'),busPrefix:'Bus',mains:['Main L','Main R']};
    if(key==='midas_hd96')return {local:null,boxes:boxList(['dl251','dl231'],'Stage I/O Input','Stage I/O Output'),busPrefix:'Bus',mains:['Main L','Main R'],note:'HD96 systems can use additional Midas I/O through the wider network ecosystem; this list starts with fixed-I/O racks that have clear socket counts.'};

    if(key==='yam_dm3')return {local,boxes:boxList(['tio1608d2','rio1608d3'],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R']};
    if(key==='yam_dm3s')return {local,boxes:[],busPrefix:'Mix',mains:['Stereo L','Stereo R'],note:'DM3 Standard has no Dante interface, so network stageboxes are not offered automatically.'};
    if(key==='yam_dm7'||key==='yam_dm7c')return {local,boxes:boxList(YAMAHA_RIO,'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo A L','Stereo A R']};
    if(key==='yam_dm')return {local:null,boxes:boxList(['rio3224d3','rio1608d3','tio1608d2'],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R']};
    if(key==='yam_clql')return {local:null,boxes:boxList([...YAMAHA_RIO,'tio1608d2'],'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R']};
    if(key==='yam_tf')return {local:null,boxes:boxList(['tio1608d2'],'Dante Input','Dante Output',{note:'TF consoles require the appropriate Dante expansion (such as NY64-D) for Tio network I/O.'}),busPrefix:'Aux',mains:['Stereo L','Stereo R']};
    if(key==='yam_rivage')return {local:null,boxes:boxList(YAMAHA_RIO,'Dante Input','Dante Output'),busPrefix:'Mix',mains:['Stereo L','Stereo R']};

    if(key==='sc_si')return {local:null,boxes:boxList(['sc32i','sc16i','sc32r','sc16r'],'MADI Input','MADI Output'),busPrefix:'Mix',mains:['Main L','Main R']};
    if(key==='sc_vi')return {local:null,boxes:boxList(['scvistage','sc32i','sc16i','sc32r','sc16r'],'MADI Input','MADI Output'),busPrefix:'Aux',mains:['Main L','Main R']};

    if(key==='digico_quantum'||key==='digico_sd'||key==='digico_s')return {local:null,boxes:boxList(['mqrack','d2rack','drack'],'Rack Input','Rack Output'),busPrefix:'Aux',mains:['Main L','Main R'],note:'Modular SD-Rack configurations are intentionally left manual because fitted cards change the actual socket count.'};

    if(key==='avid_s6l')return {local:null,boxes:boxList(['avidstage48','avidstage16'],'Stage Input','Stage Output'),busPrefix:'Aux',mains:['Main L','Main R'],note:'Stage 64 and Stage 32 are modular, so FOH Toolkit leaves those configuration-dependent racks manual for now.'};

    if(key==='presonus_s3')return {local:null,boxes:boxList(['nsb168','nsb88'],'AVB Input','AVB Output'),busPrefix:'Aux',mains:['Main L','Main R']};
    if(key==='ssl_live')return {local:null,boxes:boxList(['sslsb3224','sslsb1612'],'Dante Input','Dante Output'),busPrefix:'Aux',mains:['Main L','Main R']};
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
    if(!p||!p.outputs)return;
    for(let n=1;n<=p.outputs;n++)show.outputs.push({source:outputSourceFor(show.console,n,p.outputs),dest:`${p.outputPrefix} ${n}`,customSource:'',customDest:''});
  }
  function autoPatchChannel(show,channel,index){
    if(!show||!channel)return;
    const p=ioProfile(show.console,show.stageboxProfile||'manual');
    if(!p)return;
    const n=index+1;
    show.io=show.io||{};
    show.io[channel.id]={...(show.io[channel.id]||{}),source:n<=p.inputs?`${p.inputPrefix} ${n}`:'',channel:`Input CH ${n}`,customSource:''};
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
  function hardwareOptions(){
    const c=catalogFor(draft.console),entries=[];
    if(c.local){
      const p=c.local;entries.push(`<option value="local" ${draft.ioKey==='local'?'selected':''}>${esc(p.label)} · ${p.inputs} in / ${p.outputs} out</option>`);
    }else{
      entries.push(`<option value="manual" ${draft.ioKey==='manual'?'selected':''}>Console local I/O / manual patch</option>`);
    }
    c.boxes.forEach(p=>entries.push(`<option value="${p.id}" ${draft.ioKey===p.id?'selected':''}>${esc(p.label)} · ${p.inputs} in / ${p.outputs} out · ${esc(p.protocol)}</option>`));
    return entries.join('');
  }
  function hardwareSummary(){
    const c=catalogFor(draft.console),p=ioProfile(draft.console,draft.ioKey);
    if(!p){
      const msg=c.boxes.length?'Local I/O varies by console model, so FOH Toolkit will leave the local patch manual. Choose one of the supported stageboxes above to get automatic one-to-one patching.':'No verified remote stagebox profile is mapped for this desk yet. The show can still use local/manual I/O.';
      return `<div class="wizard-summary"><strong>Manual local patch</strong><span>${esc(msg)}</span>${c.note?`<span>${esc(c.note)}</span>`:''}</div>`;
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
      content=`<span class="eyebrow">NEW SHOW · 3 OF 3</span><h2>${hasBoxes?'Choose stagebox / local I/O':'Choose I/O starting point'}</h2><p class="wizard-copy">${hasBoxes?'FOH Toolkit now filters the I/O list for this desk. Selecting a mapped stagebox creates a one-to-one input patch as channels are added and builds the output patch now.':'This console can still use the show builder with local/manual I/O.'}</p><label class="wizard-field"><span>I/O hardware</span><select id="wizardHardware">${hardwareOptions()}</select></label>${hardwareSummary()}`;
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
    const sub=p?`Inputs follow ${p.label} automatically.`:'Local/manual I/O selected.';
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
    setTimeout(()=>{const v=document.getElementById('versionText');if(v)v.textContent='Prototype 1.7.0';},0);
  }

  loadCss();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else ready();
})();
