/* FOH Toolkit Prototype 1.6 — guided show setup */
(function(){
  'use strict';

  const SQ_KEYS=new Set(['ah_sq5','ah_sq6','ah_sq7','ah_sqrack','ah_sq5plus','ah_sq6plus','ah_sq7plus','ah_sq','sq']);
  const STAGEBOXES={
    dx168:{label:'DX168',inputs:16,outputs:8,remote:true},
    ab168:{label:'AB168',inputs:16,outputs:8,remote:true},
    ar2412:{label:'AR2412',inputs:24,outputs:12,remote:true},
    gx4816:{label:'GX4816',inputs:48,outputs:16,remote:true},
    ar84:{label:'AR84',inputs:8,outputs:4,remote:true},
    dx164w:{label:'DX164-W',inputs:16,outputs:4,remote:true},
    dx88p:{label:'DX88-P',inputs:8,outputs:8,remote:true},
    dx012:{label:'DX012',inputs:0,outputs:12,remote:true}
  };
  const LOCAL_IO={
    ah_sq5:{label:'SQ-5 local I/O',inputs:16,outputs:12,remote:false},
    ah_sq6:{label:'SQ-6 local I/O',inputs:24,outputs:14,remote:false},
    ah_sq7:{label:'SQ-7 local I/O',inputs:32,outputs:16,remote:false},
    ah_sqrack:{label:'SQ-Rack local I/O',inputs:16,outputs:12,remote:false},
    ah_sq5plus:{label:'SQ5+ local I/O',inputs:16,outputs:12,remote:false},
    ah_sq6plus:{label:'SQ6+ local I/O',inputs:24,outputs:14,remote:false},
    ah_sq7plus:{label:'SQ7+ local I/O',inputs:32,outputs:16,remote:false},
    ah_sq:{label:'SQ local I/O',inputs:16,outputs:12,remote:false},
    sq:{label:'SQ local I/O',inputs:16,outputs:12,remote:false}
  };

  let draft={step:0,name:'New Show',console:'generic',ioKey:'local',pendingPreset:null};

  function isSqKey(key){return SQ_KEYS.has(String(key||''));}
  function normalKey(key){return typeof normaliseConsoleKey==='function'?normaliseConsoleKey(key):String(key||'generic');}
  function localFor(consoleKey){return LOCAL_IO[normalKey(consoleKey)]||null;}
  function ioProfile(consoleKey,ioKey){
    const key=normalKey(consoleKey);
    if(!isSqKey(key)) return null;
    return ioKey==='local'?localFor(key):STAGEBOXES[ioKey]||null;
  }

  function outputSourceFor(n,total){
    if(n===total-1)return 'Main LR L';
    if(n===total)return 'Main LR R';
    if(n<=12)return `Mix ${n}`;
    return `Matrix ${n-12}`;
  }

  function applyOutputDefaults(show){
    const p=ioProfile(show.console,show.stageboxProfile||'local');
    show.outputs=[];
    if(!p)return;
    const path=p.remote?'SLink':'Local XLR';
    for(let n=1;n<=p.outputs;n++){
      show.outputs.push({source:outputSourceFor(n,p.outputs),dest:`${path} ${n}`,customSource:'',customDest:''});
    }
  }

  function autoPatchChannel(show,channel,index){
    if(!show||!channel)return;
    const p=ioProfile(show.console,show.stageboxProfile||'local');
    if(!p)return;
    const n=index+1;
    const path=p.remote?'SLink':'Local XLR';
    show.io=show.io||{};
    show.io[channel.id]={
      ...(show.io[channel.id]||{}),
      source:n<=p.inputs?`${path} ${n}`:'',
      channel:`Input CH ${n}`,
      customSource:''
    };
  }

  function addPresetToShow(show,preset){
    const ch={id:crypto.randomUUID(),presetId:preset.id,name:preset.name};
    show.channels.push(ch);
    autoPatchChannel(show,ch,show.channels.length-1);
    return ch;
  }

  function ensureWizard(){
    let d=document.getElementById('newShowWizard');
    if(d)return d;
    d=document.createElement('dialog');
    d.id='newShowWizard';
    d.className='sheet-dialog show-wizard-dialog';
    d.innerHTML='<div class="sheet-handle"></div><div id="showWizardBody"></div><button class="icon-button close-sheet" id="closeShowWizard" aria-label="Close">×</button>';
    document.body.appendChild(d);
    d.querySelector('#closeShowWizard').addEventListener('click',()=>d.close());
    d.addEventListener('click',e=>{if(e.target===d)d.close();});
    d.addEventListener('change',handleWizardChange);
    d.addEventListener('click',handleWizardClick);
    return d;
  }

  function deskOptions(selected){
    if(typeof consoleOptionsHTML==='function')return consoleOptionsHTML(selected);
    return `<option value="${esc(selected)}">${esc(selected)}</option>`;
  }

  function hardwareOptions(){
    const consoleKey=normalKey(draft.console);
    if(!isSqKey(consoleKey))return '<option value="manual">Local / manual I/O</option>';
    const local=localFor(consoleKey)||LOCAL_IO.ah_sq;
    const entries=[`<option value="local" ${draft.ioKey==='local'?'selected':''}>${esc(local.label)} · ${local.inputs} in / ${local.outputs} out</option>`];
    Object.entries(STAGEBOXES).forEach(([key,p])=>entries.push(`<option value="${key}" ${draft.ioKey===key?'selected':''}>${esc(p.label)} · ${p.inputs} in / ${p.outputs} out</option>`));
    return entries.join('');
  }

  function hardwareSummary(){
    const p=ioProfile(draft.console,draft.ioKey);
    if(!p){
      return '<div class="wizard-summary"><strong>Manual I/O</strong><span>This desk does not have a model-specific stagebox default mapped yet. The show will still be created for the selected desk and you can patch I/O manually.</span></div>';
    }
    const path=p.remote?'SLink':'Local XLR';
    const inputs=p.inputs?`CH 1 → ${path} 1, CH 2 → ${path} 2 … up to CH ${p.inputs}.`:'This is an output-only device, so channel inputs will stay unpatched.';
    let outputs='No outputs available.';
    if(p.outputs>=2){
      const mixCount=p.outputs-2;
      const mid=mixCount<=12?`Mix 1–${mixCount}`:`Mix 1–12 then Matrix 1–${mixCount-12}`;
      outputs=`${mid} use outputs 1–${mixCount}. Main L → ${path} ${p.outputs-1}; Main R → ${path} ${p.outputs}.`;
    }
    return `<div class="wizard-summary"><strong>${esc(p.label)}</strong><span>${esc(inputs)}</span><span>${esc(outputs)}</span></div>`;
  }

  function progressHTML(){
    return `<div class="wizard-progress" aria-label="Step ${draft.step+1} of 3"><span class="${draft.step>=0?'active':''}"></span><span class="${draft.step>=1?'active':''}"></span><span class="${draft.step>=2?'active':''}"></span></div>`;
  }

  function renderWizard(){
    const body=document.getElementById('showWizardBody');
    if(!body)return;
    let content='';
    if(draft.step===0){
      content=`<span class="eyebrow">NEW SHOW · 1 OF 3</span><h2>What are we building?</h2><p class="wizard-copy">Give the show a name. You can rename it later.</p><label class="wizard-field"><span>Show name</span><input id="wizardShowName" value="${esc(draft.name)}" maxlength="80" autocomplete="off" /></label>`;
    }else if(draft.step===1){
      const profile=typeof getDeskProfile==='function'?getDeskProfile(normalKey(draft.console)):null;
      content=`<span class="eyebrow">NEW SHOW · 2 OF 3</span><h2>Select the console</h2><p class="wizard-copy">The show will use this desk for preset translation, I/O choices and native export where supported.</p><label class="wizard-field"><span>Console</span><select id="wizardConsole">${deskOptions(normalKey(draft.console))}</select></label>${profile?`<div class="wizard-summary compact"><strong>${esc(profile.name)}</strong><span>${esc(profile.family||'FOH Toolkit console profile')}</span></div>`:''}`;
    }else{
      const sq=isSqKey(normalKey(draft.console));
      content=`<span class="eyebrow">NEW SHOW · 3 OF 3</span><h2>${sq?'Choose stagebox / local I/O':'Choose I/O starting point'}</h2><p class="wizard-copy">${sq?'FOH Toolkit will create the one-to-one input patch as channels are added and build the output patch now.':'This console can still use the show builder; desk-specific stagebox defaults will be added as they are mapped.'}</p><label class="wizard-field"><span>I/O hardware</span><select id="wizardHardware">${hardwareOptions()}</select></label>${hardwareSummary()}`;
    }
    body.innerHTML=`${progressHTML()}<div class="wizard-content">${content}</div><div class="wizard-actions">${draft.step?'<button class="secondary" id="wizardBack">‹ Back</button>':''}<button class="primary" id="wizardNext">${draft.step===2?'Create show':'Next ›'}</button></div>`;
    if(draft.step===0)setTimeout(()=>document.getElementById('wizardShowName')?.focus(),20);
  }

  function openWizard(preset){
    draft={step:0,name:'New Show',console:normalKey(state.console||localStorage.getItem('fohConsole')||'generic'),ioKey:'local',pendingPreset:preset||null};
    const d=ensureWizard();
    renderWizard();
    if(!d.open)d.showModal();
    d.scrollTop=0;
  }

  function handleWizardChange(e){
    if(e.target?.id==='wizardShowName')draft.name=e.target.value;
    if(e.target?.id==='wizardConsole'){
      draft.console=normalKey(e.target.value);
      draft.ioKey=isSqKey(draft.console)?'local':'manual';
      renderWizard();
    }
    if(e.target?.id==='wizardHardware'){
      draft.ioKey=e.target.value;
      renderWizard();
    }
  }

  function createShowFromWizard(){
    const name=(document.getElementById('wizardShowName')?.value||draft.name||'New Show').trim();
    if(!name){toast('Give the show a name first');draft.step=0;renderWizard();return;}
    draft.name=name;
    const consoleKey=normalKey(draft.console);
    const show={id:crypto.randomUUID(),name,console:consoleKey,channels:[],io:{},outputs:[],softKeys:[]};
    if(isSqKey(consoleKey))show.stageboxProfile=draft.ioKey==='manual'?'local':draft.ioKey;
    applyOutputDefaults(show);
    if(draft.pendingPreset)addPresetToShow(show,draft.pendingPreset);
    state.shows.push(show);
    persist();
    renderShows();
    document.getElementById('newShowWizard')?.close();
    const presetDialog=document.getElementById('presetDialog');if(presetDialog?.open)presetDialog.close();
    toast(`${show.name} created · ${typeof getDeskProfile==='function'?getDeskProfile(show.console).name:show.console}`);
    setTimeout(()=>openShow(show.id),0);
  }

  function handleWizardClick(e){
    if(e.target?.id==='wizardBack'){
      draft.step=Math.max(0,draft.step-1);renderWizard();return;
    }
    if(e.target?.id!=='wizardNext')return;
    if(draft.step===0){
      const input=document.getElementById('wizardShowName');
      draft.name=(input?.value||'').trim();
      if(!draft.name){toast('Give the show a name first');input?.focus();return;}
    }
    if(draft.step<2){draft.step++;renderWizard();return;}
    createShowFromWizard();
  }

  // Replace the old prompt-based New Show handler before app init binds it.
  bindShows=function(){
    document.getElementById('newShowBtn')?.addEventListener('click',()=>openWizard());
  };

  // Keep the existing "Add to a show" flow, but automatically patch a newly
  // added channel when that show has an SQ local/stagebox profile selected.
  const oldChooseShowForPreset=chooseShowForPreset;
  chooseShowForPreset=function(p){
    ensureShowDefaults();
    if(!state.shows.length){openWizard(p);return;}
    const before=new Map(state.shows.map(s=>[s.id,new Set(s.channels.map(c=>c.id))]));
    oldChooseShowForPreset(p);
    for(const show of state.shows){
      const known=before.get(show.id)||new Set();
      const idx=show.channels.findIndex(c=>!known.has(c.id));
      if(idx<0)continue;
      autoPatchChannel(show,show.channels[idx],idx);
      persist();
      break;
    }
  };

  // Add a direct path from an empty show back to the preset library.
  const oldShowChannelsPane=showChannelsPane;
  showChannelsPane=function(show){
    const html=oldShowChannelsPane(show);
    const marker='<div class="show-pane active" data-show-pane="channels">';
    if(!html.includes(marker))return html;
    const action=`<div class="show-build-actions"><button class="primary" id="browsePresetsForShow">＋ Add channels from presets</button><span>Channel inputs will follow the selected I/O hardware automatically.</span></div>`;
    return html.replace(marker,marker+action);
  };

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('#browsePresetsForShow'))return;
    const d=document.getElementById('showDialog');if(d?.open)d.close();
    switchScreen('presets');
    toast('Choose a preset, then tap Add to a show');
  });

  ensureWizard();
  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>{const v=document.getElementById('versionText');if(v)v.textContent='Prototype 1.6.0';},0);
  });
})();
