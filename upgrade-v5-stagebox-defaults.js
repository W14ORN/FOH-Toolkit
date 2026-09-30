/* FOH Toolkit Prototype 1.9 — SQ stagebox/local default patching */
(function(){
  'use strict';

  const SQ_KEYS = new Set(['ah_sq5','ah_sq6','ah_sq7','ah_sqrack','ah_sq5plus','ah_sq6plus','ah_sq7plus','ah_sq','sq']);
  let activeShowId = null;

  const STAGEBOXES = {
    gx4816: {label:'GX4816', inputs:48, outputs:16, remote:true},
    dx32:   {label:'DX32', inputs:0, outputs:0, remote:true, manual:true, countsLabel:'modular · up to 32 × 32'},
    dx168:  {label:'DX168', inputs:16, outputs:8,  remote:true},
    dx164w: {label:'DX164-W',inputs:16, outputs:4,  remote:true},
    dx88p:  {label:'DX88-P', inputs:8,  outputs:8,  remote:true},
    dx012:  {label:'DX012',  inputs:0,  outputs:12, remote:true},
    ar2412: {label:'AR2412', inputs:24, outputs:12, remote:true},
    ar84:   {label:'AR84',   inputs:8,  outputs:4,  remote:true},
    ab168:  {label:'AB168',  inputs:16, outputs:8,  remote:true}
  };

  const LOCAL_IO = {
    ah_sq5:{inputs:16,outputs:12,label:'SQ-5 local I/O'},
    ah_sq6:{inputs:24,outputs:14,label:'SQ-6 local I/O'},
    ah_sq7:{inputs:32,outputs:16,label:'SQ-7 local I/O'},
    ah_sqrack:{inputs:16,outputs:12,label:'SQ-Rack local I/O'},
    ah_sq5plus:{inputs:16,outputs:12,label:'SQ5+ local I/O'},
    ah_sq6plus:{inputs:24,outputs:14,label:'SQ6+ local I/O'},
    ah_sq7plus:{inputs:32,outputs:16,label:'SQ7+ local I/O'},
    ah_sq:{inputs:16,outputs:12,label:'SQ local I/O'},
    sq:{inputs:16,outputs:12,label:'SQ local I/O'}
  };

  function isSq(show){return !!show && SQ_KEYS.has(String(show.console||''));}
  function currentShow(){return state.shows.find(s=>s.id===activeShowId)||null;}
  function localProfile(show){return Object.assign({remote:false},LOCAL_IO[show.console]||LOCAL_IO.ah_sq);}
  function profileFor(show,key){return key==='local'?localProfile(show):STAGEBOXES[key]||null;}
  function selectedKey(show){return show.stageboxProfile||'local';}

  function outputSourceFor(index,total){
    if(index===total-1) return 'Main LR L';
    if(index===total) return 'Main LR R';
    if(index<=12) return `Mix ${index}`;
    return `Matrix ${index-12}`;
  }

  function hasProgramming(show){
    return Object.values(show.io||{}).some(v=>v&&v.source) || (show.outputs||[]).length>0;
  }

  function applyDefaults(show,key){
    const p=profileFor(show,key);
    if(!p) return {inputs:0,outputs:0};
    show.stageboxProfile=key;
    show.io=show.io||{};

    if(p.manual){
      show.channels.forEach((c,i)=>{
        const ch=i+1,io=show.io[c.id]||{};
        io.channel=`Input CH ${ch}`;io.source='';io.customSource='';show.io[c.id]=io;
      });
      show.outputs=[];
      return {inputs:0,outputs:0,manual:true};
    }

    let patchedInputs=0;
    show.channels.forEach((c,i)=>{
      const ch=i+1;
      const io=show.io[c.id]||{};
      io.channel=`Input CH ${ch}`;
      io.customSource='';
      if(ch<=p.inputs){
        io.source=p.remote?`SLink ${ch}`:`Local XLR ${ch}`;
        patchedInputs++;
      }else{
        io.source='';
      }
      show.io[c.id]=io;
    });

    show.outputs=[];
    for(let n=1;n<=p.outputs;n++){
      show.outputs.push({
        source:outputSourceFor(n,p.outputs),
        dest:p.remote?`SLink ${n}`:`Local XLR ${n}`,
        customSource:'',
        customDest:''
      });
    }
    return {inputs:patchedInputs,outputs:p.outputs};
  }

  function option(value,label,selected){return `<option value="${value}" ${value===selected?'selected':''}>${esc(label)}</option>`;}

  function summary(show,key){
    const p=profileFor(show,key);
    if(!p) return '';
    if(p.manual)return 'DX32 is a modular rack. FOH Toolkit will keep the show linked to DX32 but leave socket-level input and output patching manual so it does not guess the fitted cards.';
    const path=p.remote?'SLink':'Local XLR';
    const inText=p.inputs?`Input CH 1 → ${path} 1, CH 2 → ${path} 2, and so on up to ${p.inputs}.`:'This device is output-only, so inputs are left unpatched.';
    let outText='No physical outputs available.';
    if(p.outputs>=2){
      const pre=p.outputs-2;
      outText=`Outputs 1–${pre} default to ${pre<=12?`Mix 1–${pre}`:`Mix 1–12 then Matrix 1–${pre-12}`}; ${path} ${p.outputs-1} = Main L and ${path} ${p.outputs} = Main R.`;
    }
    return `${inText} ${outText}`;
  }

  function panelHTML(show){
    const selected=selectedKey(show),local=localProfile(show),p=profileFor(show,selected)||local;
    const stageboxOptions=Object.entries(STAGEBOXES).map(([k,v])=>option(k,v.manual?`${v.label} · ${v.countsLabel} · manual patch`:`${v.label} · ${v.inputs} in / ${v.outputs} out`,selected)).join('');
    const countText=p.manual?'Modular':`${p.inputs} in · ${p.outputs} out`;
    return `<div class="panel show-config-panel stagebox-default-panel">
      <div class="section-mini-head"><div><span class="eyebrow">I/O HARDWARE DEFAULT</span><h3>Stagebox / local patch</h3></div><span class="count-pill">${esc(countText)}</span></div>
      <p class="helper no-top">Choose the I/O hardware for this show. Fixed-I/O expanders get the normal one-to-one input patch and a sensible output starting point automatically; modular DX32 stays manual.</p>
      <div class="stagebox-default-row">
        <select id="stageboxProfileSelect" aria-label="Stagebox or local I/O">
          ${option('local',`${local.label} · ${local.inputs} in / ${local.outputs} out`,selected)}
          ${stageboxOptions}
        </select>
        <button class="secondary" id="applyStageboxDefaultsBtn">Reapply default patch</button>
      </div>
      <div class="stagebox-map-note"><strong>${esc(p.label)}</strong><span>${esc(summary(show,selected))}</span></div>
      <p class="helper">You can still change any individual input or output afterwards. Reapplying the default patch will overwrite those manual I/O changes.</p>
    </div>`;
  }

  function rerenderConsole(show){
    const dialog=$('#showDialog');
    if(dialog?.open) dialog.close();
    setTimeout(()=>{
      openShow(show.id);
      setTimeout(()=>document.querySelector('[data-show-tab="console"]')?.click(),40);
    },0);
  }

  const previousShowConsolePane=showConsolePane;
  showConsolePane=function(show){
    const html=previousShowConsolePane(show);
    if(!isSq(show)) return html;
    const marker='<div class="show-pane" data-show-pane="console">';
    return html.includes(marker)?html.replace(marker,marker+panelHTML(show)):panelHTML(show)+html;
  };

  const previousOpenShow=openShow;
  openShow=function(id){activeShowId=id;return previousOpenShow(id);};

  document.addEventListener('change',e=>{
    if(e.target?.id!=='stageboxProfileSelect') return;
    const show=currentShow(); if(!show||!isSq(show)) return;
    const next=e.target.value;
    const old=selectedKey(show);
    if(next===old) return;
    if(hasProgramming(show) && !confirm('Apply this hardware default? This will replace the show’s current input and output patching.')){
      e.target.value=old;
      return;
    }
    const result=applyDefaults(show,next);
    persist();
    toast(result.manual?`${profileFor(show,next).label}: selected · patch manually`:`${profileFor(show,next).label}: ${result.inputs} inputs and ${result.outputs} outputs defaulted`);
    rerenderConsole(show);
  });

  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#applyStageboxDefaultsBtn');
    if(!btn) return;
    const show=currentShow(); if(!show||!isSq(show)) return;
    if(hasProgramming(show) && !confirm('Reapply the selected hardware default? This will overwrite manual input/output patch changes.')) return;
    const key=selectedKey(show),result=applyDefaults(show,key);
    persist();
    toast(result.manual?`${profileFor(show,key).label}: manual patch reset`:`${profileFor(show,key).label}: default patch reapplied`);
    rerenderConsole(show);
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const v=$('#versionText'); if(v) v.textContent='Prototype 1.9.0';
  });
})();
