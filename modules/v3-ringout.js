/* FOH Toolkit 3.0 — guided Ring Out workflow */
(function(){
  'use strict';
  let target='Wedge 1',step=1;
  function ensureTools(){
    const screen=document.getElementById('screen-ringout'),display=document.getElementById('ringDisplay');if(!screen||!display||document.getElementById('v3RingWorkflow'))return;
    const tools=document.createElement('div');tools.id='v3RingWorkflow';tools.className='panel v3-ring-workflow';tools.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">GUIDED RING OUT</span><h3>Choose the output first</h3></div><span class="count-pill" id="v3RingStep">STEP 1 / 4</span></div><div class="field"><label for="v3RingTarget">Monitor / PA output</label><select id="v3RingTarget">${Array.from({length:8},(_,i)=>`<option>Wedge ${i+1}</option>`).join('')}<option>Sidefill L</option><option>Sidefill R</option><option>Main PA</option><option value="custom">Custom…</option></select></div><div class="field" id="v3RingCustomWrap" hidden><label for="v3RingCustom">Custom output name</label><input id="v3RingCustom" placeholder="e.g. Drum fill"></div><div class="v3-ring-steps"><div data-step="1"><b>1</b><span>Select output</span></div><div data-step="2"><b>2</b><span>Raise slowly</span></div><div data-step="3"><b>3</b><span>Confirm peak</span></div><div data-step="4"><b>4</b><span>Save cut</span></div></div><p class="helper">Do not ring out a direct in-ear-monitor feed at the listener’s ears. Use this workflow for wedges, fills and loudspeaker systems, and keep levels safe.</p>`;
    display.parentElement.insertBefore(tools,display);bindTools();replaceSaveButton();setStep(1);
  }
  function bindTools(){
    const sel=document.getElementById('v3RingTarget'),wrap=document.getElementById('v3RingCustomWrap'),custom=document.getElementById('v3RingCustom');
    sel?.addEventListener('change',()=>{wrap.hidden=sel.value!=='custom';target=sel.value==='custom'?(custom?.value.trim()||'Custom output'):sel.value;setStep(1);});
    custom?.addEventListener('input',()=>{if(sel?.value==='custom')target=custom.value.trim()||'Custom output';});
    document.getElementById('startRingBtn')?.addEventListener('click',()=>setTimeout(()=>{if(state.ring.running)setStep(2);},20));
    document.getElementById('stopRingBtn')?.addEventListener('click',()=>setStep(1));
    window.addEventListener('foh-rta-save-peak',e=>acceptPeak(e.detail?.frequency,e.detail?.level));
  }
  function setStep(n){step=n;const pill=document.getElementById('v3RingStep');if(pill)pill.textContent=`STEP ${n} / 4`;document.querySelectorAll('.v3-ring-steps [data-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)<=n));}
  function replaceSaveButton(){
    const old=document.getElementById('saveRingBtn');if(!old||old.dataset.v3Replaced)return;const b=old.cloneNode(true);b.dataset.v3Replaced='1';b.textContent='Save cut & continue';old.replaceWith(b);b.addEventListener('click',()=>{
      if(!state.ring.current)return;state.ringCuts.push({...state.ring.current,id:crypto.randomUUID(),target,savedAt:new Date().toISOString()});state.ring.current=null;renderRingCuts();toast(`Cut saved to ${target}`);b.disabled=true;setStep(state.ring.running?2:1);if(state.ring.running){document.getElementById('ringStatusDot').className='status-dot listening';document.getElementById('ringStatus').textContent='LISTENING';document.getElementById('ringMessage').textContent=`${target}: continue raising slowly and listen for the next persistent peak.`;}
    });
  }
  function acceptPeak(f,level){if(!Number.isFinite(Number(f)))return;const freq=typeof smartEqFreq==='function'?smartEqFreq(Number(f)):Math.round(Number(f));state.ring.current={frequency:freq,rawFrequency:Number(f),cut:-3,q:6,confidence:70,source:'RTA'};if(typeof showRingDetection==='function')showRingDetection(state.ring.current);setStep(3);const msg=document.getElementById('ringMessage');if(msg)msg.textContent=`RTA peak loaded for ${target}. Confirm it is actually ringing before applying the cut.`;const save=document.getElementById('saveRingBtn');if(save)save.disabled=false;switchScreen?.('ringout');}
  window.fohRingOut={acceptPeak};

  const baseDetection=window.showRingDetection||showRingDetection;
  window.showRingDetection=showRingDetection=function(x){const r=baseDetection(x);setStep(3);const msg=document.getElementById('ringMessage');if(msg&&state.ring.running)msg.textContent=`${target}: persistent narrow peak detected · confidence ${x.confidence}%`;return r;};

  window.renderRingCuts=renderRingCuts=function(){
    const el=document.getElementById('ringCuts');if(!el)return;if(!state.ringCuts.length){el.className='list-stack empty-state';el.textContent='No cuts saved yet.';return;}el.className='list-stack v3-ring-cuts';const groups=new Map();state.ringCuts.forEach(x=>{const k=x.target||'Unassigned';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x);});el.innerHTML=[...groups].map(([name,cuts])=>`<div class="v3-ring-group"><div class="section-mini-head"><div><span class="eyebrow">OUTPUT</span><h3>${esc(name)}</h3></div><span class="count-pill">${cuts.length} CUT${cuts.length===1?'':'S'}</span></div>${cuts.map((x,i)=>`<div class="list-item"><div class="freq-chip">${fmtFreq(x.frequency)}</div><div class="grow"><h4>${x.cut} dB · Q ${Number(x.q).toFixed(1)}</h4><p>Cut ${i+1} · ${x.confidence||'—'}% confidence${x.source==='RTA'?' · from RTA':''}</p></div><button class="mini-btn" data-cut-remove="${esc(x.id)}">Remove</button></div>`).join('')}</div>`).join('');el.querySelectorAll('[data-cut-remove]').forEach(b=>b.addEventListener('click',()=>{state.ringCuts=state.ringCuts.filter(x=>x.id!==b.dataset.cutRemove);renderRingCuts();}));
  };
  function ready(){ensureTools();renderRingCuts();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();
