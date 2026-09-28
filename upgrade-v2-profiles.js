/* FOH Toolkit — Show Workflow + Console Translation Upgrade */

const fohGroups = {
  drums:       { name:'Drums', color:'#ff7a59', soft:'rgba(255,122,89,.14)' },
  bass:        { name:'Bass', color:'#9a82ff', soft:'rgba(154,130,255,.14)' },
  instruments: { name:'Guitars / Instruments', color:'#4fa8ff', soft:'rgba(79,168,255,.14)' },
  keys:        { name:'Keys', color:'#f2c94c', soft:'rgba(242,201,76,.14)' },
  vox:         { name:'Vox', color:'#ff6cab', soft:'rgba(255,108,171,.14)' },
  di:          { name:'DI / Playback', color:'#46d7a4', soft:'rgba(70,215,164,.14)' },
  other:       { name:'Other', color:'#a7b2bc', soft:'rgba(167,178,188,.13)' }
};

function groupKeyForPreset(p){
  const c=(p.category||'').toLowerCase();
  const n=(p.name||'').toLowerCase();
  if(/kick|snare|tom|overhead|drum|cymbal|hi-hat|hihat/.test(`${c} ${n}`)) return 'drums';
  if(/bass/.test(`${c} ${n}`)) return 'bass';
  if(/lead vocal|backing vocal|vocal|vox/.test(`${c} ${n}`)) return 'vox';
  if(/keys|keyboard|piano|synth|organ/.test(`${c} ${n}`)) return 'keys';
  if(/guitar|acoustic|brass|horn|sax|violin|strings|instrument/.test(`${c} ${n}`)) return 'instruments';
  if(/di|playback|laptop|tracks/.test(`${c} ${n}`)) return 'di';
  return 'other';
}

function groupForPreset(p){ return fohGroups[groupKeyForPreset(p)] || fohGroups.other; }

Object.assign(consoleProfiles, {
  generic:{name:'Generic / Any Desk',manufacturer:'Universal',family:'Generic',eqNames:['Band 1','Band 2','Band 3','Band 4'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Makeup',keyTerm:'Assignable key',note:'Universal values. Use the closest equivalent controls on the desk.'},

  ah_sq:{name:'Allen & Heath SQ / SQ+',manufacturer:'Allen & Heath',family:'SQ',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'SoftKey',note:'Use channel HPF/LPF, 4-band PEQ, Gate and Compressor. Gate attenuation is labelled Depth. Start with the standard compressor model.'},
  ah_avantis:{name:'Allen & Heath Avantis / Avantis Solo',manufacturer:'Allen & Heath',family:'Avantis',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'SoftKey',note:'Use the standard channel processing path first. Dyn8/DEEP models can change behaviour, so this translation assumes conventional channel dynamics.'},
  ah_dlive:{name:'Allen & Heath dLive',manufacturer:'Allen & Heath',family:'dLive',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'SoftKey',note:'Translated to the standard dLive channel strip. Optional DEEP processors are deliberately not substituted automatically.'},
  ah_qu:{name:'Allen & Heath Qu',manufacturer:'Allen & Heath',family:'Qu',eqNames:['LF','LMF','HMF','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'SoftKey',note:'Use the Qu 4-band PEQ and channel Gate/Compressor. Values are starting points; detector scaling can feel slightly different.'},
  ah_cq:{name:'Allen & Heath CQ',manufacturer:'Allen & Heath',family:'CQ',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate / Auto Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'Soft control',note:'CQ offers simplified processing workflows. Use Complete mode where available for the closest manual translation.'},

  behr_x32:{name:'Behringer X32 / Midas M32',manufacturer:'Behringer / Midas',family:'X32/M32',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Make Up',keyTerm:'Assign button',note:'PEQ frequency/gain/Q translate closely. Gate attenuation is Range; compressor output is Make Up Gain.'},
  behr_wing:{name:'Behringer WING / WING Compact / Rack',manufacturer:'Behringer / Midas',family:'WING',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Make Up',keyTerm:'Custom control',note:'Use clean/standard channel models for closest translation. Modelled processors can intentionally behave differently.'},
  behr_xair:{name:'Behringer X AIR / Midas MR',manufacturer:'Behringer / Midas',family:'X AIR/MR',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Gain',keyTerm:'Assignable control',note:'Translate into the standard channel PEQ, Gate and Compressor in X AIR Edit/M-Air Edit.'},
  midas_hd96:{name:'Midas HD96',manufacturer:'Behringer / Midas',family:'HD96',eqNames:['Low','Lo Mid','Hi Mid','High'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Make Up',keyTerm:'User key',note:'Use the standard channel strip as the baseline before choosing character/modelled dynamics.'},

  yam_dm:{name:'Yamaha DM7 / DM7 Compact / DM3',manufacturer:'Yamaha',family:'DM',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Dynamics 1 — Gate',gateRange:'Range',compTitle:'Dynamics 2 — Compressor',compGain:'Gain',keyTerm:'User Defined Key',note:'Mapped to Yamaha HPF + 4-band PEQ. Use Dynamics 1 for Gate/Expander and Dynamics 2 for Compressor.'},
  yam_clql:{name:'Yamaha CL / QL',manufacturer:'Yamaha',family:'CL/QL',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Dynamics 1 — Gate',gateRange:'Range',compTitle:'Dynamics 2 — Compressor',compGain:'Gain',keyTerm:'User Defined Key',note:'Mapped to HPF + 4-band PEQ, Dynamics 1 Gate/Expander and Dynamics 2 Compressor.'},
  yam_tf:{name:'Yamaha TF',manufacturer:'Yamaha',family:'TF',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Gain',keyTerm:'User Defined Key',note:'Use 1-knob processing only as a shortcut; manual mode is the closest match to FOH Toolkit values.'},
  yam_rivage:{name:'Yamaha RIVAGE PM',manufacturer:'Yamaha',family:'RIVAGE',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Dynamics 1 — Gate',gateRange:'Range',compTitle:'Dynamics 2 — Compressor',compGain:'Gain',keyTerm:'User Defined Key',note:'Mapped to the conventional channel strip. Premium Rack processors are not substituted automatically.'},

  sc_vi:{name:'Soundcraft Vi Series',manufacturer:'Soundcraft',family:'Vi',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Makeup',keyTerm:'User key',note:'Use the standard channel strip. Threshold references are approximate because detector calibration differs between console families.'},
  sc_si:{name:'Soundcraft Si Series',manufacturer:'Soundcraft',family:'Si',eqNames:['LF','LM','HM','HF'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Makeup',keyTerm:'User key',note:'Translated to the Si channel strip; use these as starting points and confirm by ear.'},
  sc_ui:{name:'Soundcraft Ui12 / Ui16 / Ui24R',manufacturer:'Soundcraft',family:'Ui',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'Assignable control',note:'Use the standard Ui channel processing. Some screens present controls differently, but the underlying targets remain equivalent.'},

  digico_quantum:{name:'DiGiCo Quantum Series',manufacturer:'DiGiCo',family:'Quantum',eqNames:['Band 1','Band 2','Band 3','Band 4'],gateTitle:'Gate / Expander',gateRange:'Depth',compTitle:'Compressor',compGain:'Make Up',keyTerm:'Macro',note:'Use standard channel processing for translation. Mustard/Spice Rack options are treated as optional colour, not direct substitutes.'},
  digico_sd:{name:'DiGiCo SD Series',manufacturer:'DiGiCo',family:'SD',eqNames:['Band 1','Band 2','Band 3','Band 4'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Make Up',keyTerm:'Macro',note:'Mapped to the standard SD channel strip. Confirm thresholds on the actual console because metering/detector references differ.'},
  digico_s:{name:'DiGiCo S21 / S31',manufacturer:'DiGiCo',family:'S Series',eqNames:['Band 1','Band 2','Band 3','Band 4'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Make Up',keyTerm:'Macro',note:'Mapped to the standard S-Series channel path.'},

  avid_s6l:{name:'Avid VENUE | S6L',manufacturer:'Avid',family:'VENUE S6L',eqNames:['LF','LMF','HMF','HF'],gateTitle:'Expander / Gate',gateRange:'Range',compTitle:'Compressor / Limiter',compGain:'Makeup',keyTerm:'Function switch',note:'Use the stock channel EQ and dynamics for the closest universal translation before inserting plug-ins.'},
  avid_legacy:{name:'Avid VENUE Profile / SC48',manufacturer:'Avid',family:'Legacy VENUE',eqNames:['LF','LMF','HMF','HF'],gateTitle:'Expander / Gate',gateRange:'Range',compTitle:'Compressor / Limiter',compGain:'Makeup',keyTerm:'Function switch',note:'Legacy VENUE translation using stock channel processing; plug-ins are not substituted automatically.'},

  presonus_s3:{name:'PreSonus StudioLive Series III',manufacturer:'PreSonus',family:'StudioLive III',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Gain',keyTerm:'User button',note:'Mapped to Fat Channel processing. Select the standard processor models for the closest match.'},
  qsc_touchmix:{name:'QSC TouchMix',manufacturer:'QSC',family:'TouchMix',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate',gateRange:'Depth',compTitle:'Compressor',compGain:'Gain',keyTerm:'User button',note:'Translate to the channel EQ and dynamics; advanced/simple modes may expose different control sets.'},
  tascam_sonicview:{name:'TASCAM Sonicview',manufacturer:'TASCAM',family:'Sonicview',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Make Up',keyTerm:'User Key',note:'Use the standard channel EQ/dynamics path. Confirm exact key assignment availability on the target firmware.'},
  ssl_live:{name:'SSL Live',manufacturer:'Solid State Logic',family:'SSL Live',eqNames:['LF','LMF','HMF','HF'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Makeup',keyTerm:'User key',note:'Use the standard channel strip first; console-specific processing options can then be chosen deliberately.'},
  waves_lv1:{name:'Waves eMotion LV1',manufacturer:'Waves',family:'eMotion LV1',eqNames:['Band 1','Band 2','Band 3','Band 4'],gateTitle:'Gate / Expander',gateRange:'Range',compTitle:'Compressor',compGain:'Makeup',keyTerm:'Custom control',note:'Translation assumes stock/clean processing. Plug-in choice can radically change behaviour.'},
  roland_m5000:{name:'Roland M-5000 / OHRCA',manufacturer:'Roland',family:'M-5000',eqNames:['LOW','LOW-MID','HIGH-MID','HIGH'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Gain',keyTerm:'User Assignable',note:'Mapped to standard channel EQ/dynamics where available.'},
  mackie_dl:{name:'Mackie DL Series',manufacturer:'Mackie',family:'DL',eqNames:['Low','Low Mid','High Mid','High'],gateTitle:'Gate',gateRange:'Range',compTitle:'Compressor',compGain:'Gain',keyTerm:'Assignable control',note:'Mapped to Master Fader channel processing; confirm available functions on the exact DL model.'}
});

consoleProfiles.sq = consoleProfiles.ah_sq;
consoleProfiles.avantis = consoleProfiles.ah_avantis;
consoleProfiles.x32 = consoleProfiles.behr_x32;
consoleProfiles.wing = consoleProfiles.behr_wing;
consoleProfiles.yamaha = consoleProfiles.yam_clql;
consoleProfiles.soundcraft = consoleProfiles.sc_vi;

function normaliseConsoleKey(key){
  const legacy={sq:'ah_sq',avantis:'ah_avantis',x32:'behr_x32',wing:'behr_wing',yamaha:'yam_clql',soundcraft:'sc_vi'};
  return legacy[key] || (consoleProfiles[key] ? key : 'generic');
}

function consoleOptionsHTML(selected){
  selected=normaliseConsoleKey(selected);
  const unique = Object.entries(consoleProfiles).filter(([k])=>!['sq','avantis','x32','wing','yamaha','soundcraft'].includes(k));
  const manufacturers=[...new Set(unique.map(([,p])=>p.manufacturer||'Other'))];
  return manufacturers.map(m=>`<optgroup label="${esc(m)}">${unique.filter(([,p])=>(p.manufacturer||'Other')===m).map(([k,p])=>`<option value="${k}" ${k===selected?'selected':''}>${esc(p.name)}</option>`).join('')}</optgroup>`).join('');
}

function getDeskProfile(key){ return consoleProfiles[normaliseConsoleKey(key)] || consoleProfiles.generic; }

function ensureShowDefaults(){
  let changed=false;
  state.console=normaliseConsoleKey(state.console);
  state.shows.forEach(s=>{
    if(!s.console){s.console=state.console||'generic';changed=true;} else {const nk=normaliseConsoleKey(s.console); if(nk!==s.console){s.console=nk;changed=true;}}
    if(!s.io || typeof s.io!=='object'){s.io={};changed=true;}
    if(!Array.isArray(s.outputs)){s.outputs=[];changed=true;}
    if(!Array.isArray(s.softKeys)){s.softKeys=[];changed=true;}
  });
  if(changed) persist();
}

function translatePreset(p, consoleKey){
  const d=getDeskProfile(consoleKey);
  const eq=(p.eq||[]).map((b,i)=>({label:(d.eqNames&&d.eqNames[i])||`Band ${i+1}`,f:b.f,g:b.g,q:b.q}));
  const gate=p.gate?[
    ['Threshold',formatDyn('threshold',p.gate.threshold)],
    [d.gateRange||'Range',formatDyn('range',p.gate.range)],
    ['Attack',formatDyn('attack',p.gate.attack)],
    ['Hold',formatDyn('hold',p.gate.hold)],
    ['Release',formatDyn('release',p.gate.release)]
  ]:[];
  const comp=p.comp?[
    ['Threshold',formatDyn('threshold',p.comp.threshold)],
    ['Ratio',p.comp.ratio],
    ['Attack',formatDyn('attack',p.comp.attack)],
    ['Release',formatDyn('release',p.comp.release)],
    [d.compGain||'Makeup',formatDyn('makeup',p.comp.makeup)]
  ]:[];
  return {desk:d,eq,gate,comp};
}

function translatedSettingsHTML(p, consoleKey, compact=false){
  const t=translatePreset(p,consoleKey);
  return `
    <div class="desk-translation-head"><div><span class="metric-label">CONSOLE FAMILY</span><strong>${esc(t.desk.family||t.desk.name)}</strong></div><span class="desk-mapped-badge">MAPPED</span></div>
    <div class="translation-note">${esc(t.desk.note||'')}</div>
    ${compact?'':`<div class="eq-card"><canvas class="translated-eq-canvas" data-preset-eq="${esc(p.id)}" width="900" height="320"></canvas></div>`}
    <div class="processing-grid">
      <div class="processing-block"><h4>Filters &amp; PEQ — ${esc(t.desk.family||'Desk')}</h4><div class="setting-list">
        <div class="setting"><span>HPF</span><strong>${p.hpf} Hz</strong></div>
        <div class="setting"><span>LPF</span><strong>${p.lpf?fmtFreq(p.lpf):'Off'}</strong></div>
        ${t.eq.map(b=>`<div class="setting"><span>${esc(b.label)}</span><strong>${b.g>0?'+':''}${b.g} dB @ ${fmtFreq(b.f)} · Q ${b.q}</strong></div>`).join('')}
      </div></div>
      <div class="processing-block"><h4>${esc(t.desk.gateTitle||'Gate')} &amp; ${esc(t.desk.compTitle||'Compressor')}</h4><div class="setting-list">
        ${p.gate?t.gate.map(([k,v])=>`<div class="setting"><span>${esc(t.desk.gateTitle||'Gate')} ${esc(k)}</span><strong>${esc(v)}</strong></div>`).join(''):'<div class="setting"><span>Gate</span><strong>Off</strong></div>'}
        ${p.comp?t.comp.map(([k,v])=>`<div class="setting"><span>${esc(t.desk.compTitle||'Comp')} ${esc(k)}</span><strong>${esc(v)}</strong></div>`).join(''):''}
      </div></div>
    </div>`;
}

if(!presets.some(p=>p.id==='keys-stereo')) presets.push({
  id:'keys-stereo',name:'Keys — Stereo',category:'Keys',style:'Pop / Rock',icon:'KEY',description:'Clean stereo keys starting point with low-end control and gentle presence.',why:'Keys can occupy almost the entire spectrum. The HPF creates room for kick/bass while gentle shaping keeps chords clear without making them brittle.',hpf:55,lpf:18000,eq:[{f:180,g:-1.5,q:1.1},{f:420,g:-2,q:1.3},{f:2600,g:1.5,q:1.1},{f:9000,g:1,q:.9}],gate:null,comp:{threshold:-12,ratio:'2:1',attack:28,release:140,makeup:0}
});
if(!presets.some(p=>p.id==='playback-di')) presets.push({
  id:'playback-di',name:'Playback / Laptop DI',category:'DI',style:'Playback',icon:'DI',description:'Neutral stereo playback starting point with headroom and rumble protection.',why:'Playback normally needs very little corrective processing. The light filtering protects headroom while leaving the source largely intact.',hpf:35,lpf:19000,eq:[{f:250,g:-1,q:1.1},{f:3000,g:0.5,q:1.0}],gate:null,comp:{threshold:-8,ratio:'2:1',attack:35,release:180,makeup:0}
});
if(!presets.some(p=>p.id==='speech-presenter')) presets.push({
  id:'speech-presenter',name:'Speech / Presenter',category:'Other',style:'Corporate / Commentary',icon:'SP',description:'Speech-focused starting point for intelligibility and feedback control.',why:'A higher HPF removes handling/room rumble and a modest presence lift improves intelligibility without relying on excessive level.',hpf:120,lpf:15000,eq:[{f:250,g:-2.5,q:1.3},{f:650,g:-1.5,q:1.4},{f:2800,g:2,q:1.2},{f:7000,g:-1,q:1.5}],gate:{threshold:-42,range:10,attack:8,hold:100,release:260},comp:{threshold:-18,ratio:'2.5:1',attack:18,release:110,makeup:0}
});

populateConsoleSelectors = function(){
  state.console=normaliseConsoleKey(state.console);
  const html=consoleOptionsHTML(state.console);
  $('#consoleSelect').innerHTML=html; $('#consoleSelect').value=state.console;
  $('#consoleSelect').addEventListener('change',e=>{state.console=normaliseConsoleKey(e.target.value);persist();toast(`Default: ${getDeskProfile(state.console).name}`);});
  $('#smoothingSelect').addEventListener('change',e=>{if(state.rta.analyser)state.rta.analyser.smoothingTimeConstant=Number(e.target.value);});
};

renderPresets = function(){
  const q=$('#presetSearch').value.trim().toLowerCase(); const cat=$('#categoryFilter').value;
  const list=presets.filter(p=>(cat==='all'||p.category===cat)&&(!q||`${p.name} ${p.category} ${p.style} ${p.description} ${groupForPreset(p).name}`.toLowerCase().includes(q)));
  $('#presetCount').textContent=`${list.length} preset${list.length===1?'':'s'}`;
  $('#presetGrid').innerHTML=list.map(p=>{const g=groupForPreset(p);return `<article class="preset-card grouped-card" data-preset="${p.id}" style="--group:${g.color};--group-soft:${g.soft}"><span class="verified">VERIFIED</span><div class="group-ribbon">${esc(g.name)}</div><div class="category-icon">${esc(p.icon)}</div><h4>${esc(p.name)}</h4><p>${esc(p.style)}</p></article>`}).join('') || '<div class="empty-state" style="grid-column:1/-1">No matching presets.</div>';
  $$('[data-preset]').forEach(c=>c.addEventListener('click',()=>openPreset(c.dataset.preset)));
};

openPreset = function(id){
  const p=presets.find(x=>x.id===id); if(!p)return;
  const g=groupForPreset(p);
  state.console=normaliseConsoleKey(state.console);
  const render=()=>{
    $('#presetDetail').innerHTML=`
      <div class="detail-head" style="--group:${g.color}"><span class="eyebrow group-text">${esc(g.name.toUpperCase())}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p></div>
      <div class="detail-badges"><span class="badge verified-badge">✓ FOH TOOLKIT VERIFIED</span><span class="badge group-badge" style="--group:${g.color};--group-soft:${g.soft}">${esc(g.name)}</span><span class="badge">${esc(p.style)}</span></div>
      <div class="console-bar"><label>TRANSLATE FOR</label><select id="detailConsole">${consoleOptionsHTML(state.console)}</select></div>
      <div id="translatedPresetSettings">${translatedSettingsHTML(p,state.console)}</div>
      <div class="why-box"><strong>Why this works as a starting point</strong><br>${esc(p.why)}</div>
      <button class="primary full" id="addPresetToShow">Add to a show</button>
      <p class="helper">The universal preset is translated into the selected desk's control names. Numeric values remain starting points — verify gain structure, source, mic, PA and room by ear.</p>`;
    requestAnimationFrame(()=>$$('.translated-eq-canvas').forEach(c=>drawEqCurve(c,p)));
    $('#detailConsole').addEventListener('change',e=>{state.console=normaliseConsoleKey(e.target.value);$('#consoleSelect').value=state.console;persist();render();});
    $('#addPresetToShow').addEventListener('click',()=>chooseShowForPreset(p));
  };
  render(); $('#presetDialog').showModal();
};
