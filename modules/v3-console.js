/* FOH Toolkit 3.0 — console capability guidance */
(function(){
  'use strict';
  const exact={
    ah_sq5:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'12 Mix · 3 Matrix · 8 DCA',controls:'8 SoftKeys'},
    ah_sq6:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'12 Mix · 3 Matrix · 8 DCA',controls:'16 SoftKeys'},
    ah_sq7:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'12 Mix · 3 Matrix · 8 DCA',controls:'16 SoftKeys'},
    ah_sqrack:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'12 Mix · 3 Matrix · 8 DCA',controls:'SQ-Rack assignable controls'},
    ah_sq5plus:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'SQ-family routing',controls:'8 SoftKeys'},
    ah_sq6plus:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'SQ-family routing',controls:'16 SoftKeys'},
    ah_sq7plus:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF',dynamics:'Gate + Compressor',routing:'SQ-family routing',controls:'16 SoftKeys'},
    behr_x32:{confidence:'Model-specific family',peq:'4-band parametric EQ',filters:'HPF + channel filtering',dynamics:'Gate/Expander + Compressor',routing:'16 buses · 6 matrices · 8 DCA',controls:'3 assign layers · 36 assign controls'},
    yam_dm3:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF/filters where available',dynamics:'Dynamics 1 + Dynamics 2',routing:'6 Mix · 2 Matrix',controls:'6 User Defined Keys'},
    yam_dm3s:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + LPF/filters where available',dynamics:'Dynamics 1 + Dynamics 2',routing:'6 Mix · 2 Matrix',controls:'6 User Defined Keys'},
    yam_dm7:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + channel filters',dynamics:'Dynamics 1 + Dynamics 2',routing:'48 Mix · 12 Matrix',controls:'Banked User Defined Keys'},
    yam_dm7c:{confidence:'Model-specific',peq:'4-band PEQ',filters:'HPF + channel filters',dynamics:'Dynamics 1 + Dynamics 2',routing:'48 Mix · 12 Matrix',controls:'Banked User Defined Keys'}
  };
  const family={
    ah_avantis:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF / LPF',dynamics:'Gate + Compressor; DEEP optional',routing:'Flexible buses / groups / matrices',controls:'SoftKeys'},
    ah_dlive:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF / LPF',dynamics:'Gate + Compressor; DEEP optional',routing:'Configurable dLive bus architecture',controls:'SoftKeys'},
    ah_qu:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF',dynamics:'Gate + Compressor',routing:'Model-dependent mixes / matrices',controls:'SoftKeys'},
    ah_cq:{confidence:'Family-level',peq:'4-band processing in Complete mode',filters:'Source-dependent HPF/filters',dynamics:'Gate / Auto Gate + Compressor',routing:'CQ model-dependent',controls:'Soft controls'},
    behr_wing:{confidence:'Family-level',peq:'Channel-model dependent; clean model recommended',filters:'Model-dependent filters',dynamics:'Model-dependent dynamics',routing:'Flexible WING buses / matrices',controls:'Custom controls'},
    behr_xair:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF',dynamics:'Gate + Compressor',routing:'Model-dependent buses',controls:'App / hardware dependent'},
    midas_hd96:{confidence:'Family-level',peq:'Standard channel EQ',filters:'Channel filters',dynamics:'Gate/Expander + Compressor',routing:'Heritage-D flexible routing',controls:'User keys'},
    yam_dm:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF',dynamics:'Dynamics 1 + Dynamics 2',routing:'Model-dependent',controls:'User Defined Keys'},
    yam_clql:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF',dynamics:'Dynamics 1 + Dynamics 2',routing:'Model-dependent Mix / Matrix',controls:'User Defined Keys'},
    yam_tf:{confidence:'Family-level',peq:'4-band PEQ in manual mode',filters:'HPF',dynamics:'Gate + Compressor',routing:'TF model-dependent',controls:'User Defined Keys'},
    yam_rivage:{confidence:'Family-level',peq:'Standard channel PEQ',filters:'Channel filters',dynamics:'Two dynamics blocks',routing:'RIVAGE configuration-dependent',controls:'User Defined Keys'},
    sc_vi:{confidence:'Family-level',peq:'4-band PEQ',filters:'Channel filters',dynamics:'Gate + Compressor',routing:'Vi model/configuration dependent',controls:'User keys'},
    sc_si:{confidence:'Family-level',peq:'4-band PEQ',filters:'Channel filters',dynamics:'Gate + Compressor',routing:'Si model-dependent',controls:'User keys'},
    sc_ui:{confidence:'Family-level',peq:'4-band PEQ',filters:'HPF',dynamics:'Gate + Compressor',routing:'Ui model-dependent',controls:'App controls'},
    digico_quantum:{confidence:'Family-level',peq:'Standard channel PEQ',filters:'Channel filters',dynamics:'Gate/Expander + Compressor',routing:'Session/configuration dependent',controls:'Macros'},
    digico_sd:{confidence:'Family-level',peq:'Standard channel PEQ',filters:'Channel filters',dynamics:'Gate + Compressor',routing:'Session/configuration dependent',controls:'Macros'},
    digico_s:{confidence:'Family-level',peq:'Standard channel PEQ',filters:'Channel filters',dynamics:'Gate + Compressor',routing:'S-Series session dependent',controls:'Macros'},
    avid_s6l:{confidence:'Family-level',peq:'Stock channel EQ',filters:'Stock channel filters',dynamics:'Expander/Gate + Compressor/Limiter',routing:'VENUE configuration dependent',controls:'Function switches'},
    presonus_s3:{confidence:'Family-level',peq:'Fat Channel EQ',filters:'Fat Channel filtering',dynamics:'Gate/Expander + Compressor',routing:'Model-dependent mixes / matrices',controls:'User controls'},
    ssl_live:{confidence:'Family-level',peq:'SSL channel EQ',filters:'Channel filters',dynamics:'Gate/Expander + Compressor',routing:'Show configuration dependent',controls:'User keys'},
    tascam_sonicview:{confidence:'Family-level',peq:'4-band channel EQ',filters:'Channel filters',dynamics:'Gate/Expander + Compressor',routing:'Model-dependent Mix / Matrix',controls:'User Keys'},
    generic:{confidence:'Universal starting point',peq:'Use closest available parametric bands',filters:'Use closest HPF / LPF',dynamics:'Use clean Gate / Compressor equivalents',routing:'Desk-specific',controls:'Desk-specific'}
  };
  function cap(key){key=typeof normaliseConsoleKey==='function'?normaliseConsoleKey(key):key;return exact[key]||family[key]||family.generic;}
  window.fohDeskCapabilities=cap;
  function decorate(id){const detail=document.getElementById('presetDetail');if(!detail||detail.querySelector('.community-separate-note'))return;const p=presets.find(x=>x.id===id);if(!p)return;let panel=detail.querySelector('#v3DeskCapability');if(!panel){panel=document.createElement('div');panel.id='v3DeskCapability';panel.className='panel v3-desk-capability';const note=detail.querySelector('.translation-note');note?.insertAdjacentElement('afterend',panel);}const key=document.getElementById('detailConsole')?.value||state.console,c=cap(key),desk=typeof getDeskProfile==='function'?getDeskProfile(key):{name:key};const bands=(p.eq||[]).length;panel.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">DESK TRANSLATION</span><h3>${esc(desk.name)}</h3></div><span class="count-pill">${esc(c.confidence)}</span></div><div class="v3-cap-grid"><div><span>EQ</span><strong>${esc(c.peq)}</strong></div><div><span>Filters</span><strong>${esc(c.filters)}</strong></div><div><span>Dynamics</span><strong>${esc(c.dynamics)}</strong></div><div><span>Routing</span><strong>${esc(c.routing)}</strong></div><div><span>Assignable controls</span><strong>${esc(c.controls)}</strong></div><div><span>This preset</span><strong>${bands} PEQ band${bands===1?'':'s'}</strong></div></div><p class="helper">FOH Toolkit translates control intent, not detector calibration. Confirm thresholds, slopes and available routing on the actual desk/firmware before the show.</p>`;document.getElementById('detailConsole')?.addEventListener('change',()=>setTimeout(()=>decorate(id),0),{once:true});}
  const prior=window.openPreset||openPreset;window.openPreset=openPreset=function(id){const r=prior(id);requestAnimationFrame(()=>decorate(id));return r;};
})();
