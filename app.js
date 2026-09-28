const APP_VERSION = 'Prototype 1.0.0';

const consoleProfiles = {
  generic: { name: 'Generic / Any Desk', note: 'Use the values exactly as shown. Names may vary slightly between consoles.' },
  sq: { name: 'Allen & Heath SQ', note: 'PEQ frequency/gain/Q translate directly. Gate uses Threshold/Depth/Attack/Hold/Release. Compressor uses Threshold/Ratio/Attack/Release/Gain.' },
  avantis: { name: 'Allen & Heath Avantis / dLive', note: 'Use channel PEQ, Gate and Compressor. Values translate directly; compressor character/model may change the result, so use the standard/clean model first.' },
  x32: { name: 'Behringer X32 / Midas M32', note: 'PEQ translates directly. Gate Range is the attenuation depth. Compressor Make Up Gain is the manual output gain.' },
  wing: { name: 'Behringer WING', note: 'Use a clean channel strip model for closest translation. PEQ values translate directly.' },
  yamaha: { name: 'Yamaha DM / QL / CL', note: 'Use HPF + 4-band PEQ. Dynamics 1 can be Gate/Expander and Dynamics 2 Compressor. Attack/release behaviour may feel slightly different.' },
  soundcraft: { name: 'Soundcraft Ui / Vi', note: 'Use the closest standard channel dynamics and PEQ. Treat threshold values as starting points because detector calibration differs by desk.' }
};

const presets = [
  {
    id:'kick-rock', name:'Kick — Rock', category:'Kick', style:'Rock / Indie', icon:'K', description:'Punch, weight and enough click to stay defined through guitars.', why:'The low boost adds weight, the 250 Hz cut reduces boxiness and the upper-mid lift helps the beater speak through a dense mix.',
    hpf:40, lpf:10000,
    eq:[{f:70,g:5,q:1.2},{f:250,g:-4,q:1.5},{f:3500,g:3,q:1.4},{f:8000,g:1,q:1.2}],
    gate:{threshold:-30,range:25,attack:5,hold:30,release:120},
    comp:{threshold:-18,ratio:'3:1',attack:10,release:80,makeup:0}
  },
  {
    id:'snare-rock', name:'Snare — Rock', category:'Snare', style:'Rock / Indie', icon:'S', description:'Full snare with crack, less cardboard and controlled spill.', why:'A moderate HPF clears kick spill, a low-mid cut reduces papery tone and the presence lift adds stick attack without relying on extreme top end.',
    hpf:90, lpf:14000,
    eq:[{f:190,g:2.5,q:1.1},{f:500,g:-3.5,q:1.6},{f:4500,g:3,q:1.3},{f:9000,g:1.5,q:1.1}],
    gate:{threshold:-34,range:18,attack:3,hold:60,release:180},
    comp:{threshold:-16,ratio:'3:1',attack:18,release:110,makeup:0}
  },
  {
    id:'rack-tom', name:'Rack Tom — Rock', category:'Toms', style:'Rock', icon:'T', description:'Round fundamental with less mud and a clear attack.', why:'The fundamental area gives the tom size while a cut through the low mids reduces cardboard tone. The upper-mid lift restores stick definition.',
    hpf:60, lpf:12000,
    eq:[{f:110,g:3,q:1.2},{f:400,g:-4,q:1.5},{f:4500,g:2.5,q:1.4}],
    gate:{threshold:-32,range:25,attack:4,hold:80,release:220},
    comp:{threshold:-14,ratio:'3:1',attack:20,release:120,makeup:0}
  },
  {
    id:'floor-tom', name:'Floor Tom — Rock', category:'Toms', style:'Rock', icon:'T', description:'Deep floor tom that stays tight instead of blooming into the mix.', why:'A lower fundamental boost keeps the drum large while the low-mid cut removes the hollow/cardboard region that often builds up on stage.',
    hpf:45, lpf:11000,
    eq:[{f:80,g:3.5,q:1.2},{f:330,g:-4,q:1.5},{f:4000,g:2.5,q:1.4}],
    gate:{threshold:-32,range:25,attack:4,hold:100,release:260},
    comp:{threshold:-14,ratio:'3:1',attack:22,release:130,makeup:0}
  },
  {
    id:'overhead', name:'Overhead — Rock', category:'Overhead', style:'Rock / Indie', icon:'OH', description:'Cymbal detail without filling the PA with unnecessary low end.', why:'The high-pass filter leaves kick and tom weight to the close mics. A small harshness cut can make bright cymbals easier to listen to for a whole show.',
    hpf:180, lpf:18000,
    eq:[{f:450,g:-1.5,q:1.2},{f:3200,g:-2,q:1.8},{f:10000,g:1.5,q:0.9}],
    gate:null,
    comp:{threshold:-10,ratio:'2:1',attack:30,release:180,makeup:0}
  },
  {
    id:'bass-di', name:'Bass DI — Rock', category:'Bass', style:'Rock / Indie', icon:'B', description:'Solid low end with note definition and controlled dynamics.', why:'The subsonic filter protects headroom, the low-mid shaping keeps bass audible on smaller systems and gentle compression evens out playing dynamics.',
    hpf:38, lpf:8000,
    eq:[{f:80,g:2.5,q:1.1},{f:250,g:-2.5,q:1.4},{f:850,g:2,q:1.2},{f:2800,g:1.5,q:1.4}],
    gate:null,
    comp:{threshold:-18,ratio:'4:1',attack:28,release:120,makeup:0}
  },
  {
    id:'rhythm-guitar', name:'Rhythm Guitar', category:'Electric Guitar', style:'Indie / Rock', icon:'G', description:'Keeps distorted rhythm guitar out of the bass and vocal space.', why:'Guitar cabinets rarely need deep lows through the PA. Trimming low mids reduces congestion while a controlled presence area keeps the part articulate.',
    hpf:90, lpf:10500,
    eq:[{f:180,g:-1.5,q:1.1},{f:320,g:-2.5,q:1.4},{f:1800,g:1.5,q:1.2},{f:4200,g:-1.5,q:1.6}],
    gate:null,
    comp:{threshold:-10,ratio:'2:1',attack:25,release:110,makeup:0}
  },
  {
    id:'lead-guitar', name:'Lead Guitar', category:'Electric Guitar', style:'Indie / Rock', icon:'G', description:'Forward enough for hooks and solos without getting painfully bright.', why:'A slightly stronger presence lift than the rhythm preset helps the lead part clear the mix, while the high cut controls fizzy cabinet or modeller content.',
    hpf:85, lpf:10000,
    eq:[{f:220,g:-2,q:1.2},{f:1200,g:1.5,q:1.1},{f:2600,g:2.5,q:1.3},{f:5200,g:-1.5,q:1.6}],
    gate:null,
    comp:{threshold:-10,ratio:'2:1',attack:25,release:110,makeup:0}
  },
  {
    id:'acoustic', name:'Acoustic Guitar DI', category:'Acoustic Guitar', style:'Live / Pop / Rock', icon:'A', description:'Cleaner DI tone with less boom and piezo harshness.', why:'Acoustic DI signals often build up around the low mids and can sound hard in the upper mids. These moves aim for a more natural, mix-ready starting point.',
    hpf:90, lpf:14000,
    eq:[{f:180,g:-2,q:1.3},{f:350,g:-2.5,q:1.4},{f:2400,g:-2,q:1.7},{f:8000,g:1.5,q:1.0}],
    gate:null,
    comp:{threshold:-16,ratio:'3:1',attack:22,release:140,makeup:0}
  },
  {
    id:'lead-vocal-male', name:'Lead Vocal — Male', category:'Lead Vocal', style:'Rock / Indie', icon:'V', description:'Clear, forward vocal with low-mid cleanup and controlled presence.', why:'The HPF removes stage rumble. A small low-mid cut helps intelligibility and the presence lift improves clarity, but both should be adjusted to the singer and microphone.',
    hpf:100, lpf:16000,
    eq:[{f:220,g:-2.5,q:1.3},{f:550,g:-1.5,q:1.5},{f:3000,g:2.5,q:1.2},{f:8500,g:1.5,q:1.0}],
    gate:{threshold:-45,range:10,attack:8,hold:80,release:240},
    comp:{threshold:-18,ratio:'3:1',attack:18,release:100,makeup:0}
  },
  {
    id:'lead-vocal-female', name:'Lead Vocal — Female', category:'Lead Vocal', style:'Rock / Pop', icon:'V', description:'Open and present vocal with controlled low mids and sibilance region.', why:'The shape is intentionally gentle. Vocal EQ is source-dependent, so this preset aims to create space and presence without imposing a heavy tonal signature.',
    hpf:115, lpf:17000,
    eq:[{f:260,g:-2,q:1.3},{f:700,g:-1.5,q:1.4},{f:3500,g:2,q:1.2},{f:10000,g:1,q:0.9}],
    gate:{threshold:-46,range:9,attack:8,hold:80,release:250},
    comp:{threshold:-18,ratio:'3:1',attack:16,release:95,makeup:0}
  },
  {
    id:'backing-vocal', name:'Backing Vocal', category:'Backing Vocal', style:'Rock / Indie', icon:'BV', description:'Tidy backing vocal that supports the lead without fighting it.', why:'A slightly higher HPF and less presence than the lead vocal helps backing vocals sit behind the lead while remaining intelligible.',
    hpf:120, lpf:15000,
    eq:[{f:250,g:-2.5,q:1.3},{f:650,g:-1.5,q:1.5},{f:2800,g:1.5,q:1.3},{f:8000,g:1,q:1.0}],
    gate:{threshold:-44,range:12,attack:8,hold:80,release:230},
    comp:{threshold:-18,ratio:'3:1',attack:15,release:100,makeup:0}
  }
];

const seededCommunity = [
  {id:'c1',name:'Snare — Big Festival Rock',category:'Snare',style:'Rock',author:'A. Morgan',rating:4.8,ratings:42,description:'More body and a slower compressor attack for a large, open snare sound.',settings:'HPF 85 Hz · +3 dB @ 190 Hz · -4 dB @ 520 Hz · +3 dB @ 4.8 kHz · Comp 3:1'},
  {id:'c2',name:'Speech Mic — Outdoor PA',category:'Speech',style:'Commentary',author:'J. Ellis',rating:4.7,ratings:31,description:'Tight speech preset for outdoor commentary systems and long PA runs.',settings:'HPF 120 Hz · -3 dB @ 250 Hz · +2 dB @ 2.7 kHz · Comp 2.5:1'}
];

const state = {
  screen:'presets',
  console:localStorage.getItem('fohConsole') || 'generic',
  shows:JSON.parse(localStorage.getItem('fohShows') || '[]'),
  submissions:JSON.parse(localStorage.getItem('fohSubmissions') || '[]'),
  ringCuts:[],
  rta:{context:null,stream:null,source:null,analyser:null,data:null,raf:null,running:false},
  ring:{running:false,lastCandidate:null,stableSince:0,current:null},
  deferredInstall:null
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
const logX = (f,w) => (Math.log10(clamp(f,20,20000)) - Math.log10(20)) / (Math.log10(20000)-Math.log10(20)) * w;
const fmtFreq = f => f >= 1000 ? `${(f/1000).toFixed(f>=10000?0:1)} kHz` : `${Math.round(f)} Hz`;

function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),2200); }
function persist(){ localStorage.setItem('fohShows',JSON.stringify(state.shows)); localStorage.setItem('fohSubmissions',JSON.stringify(state.submissions)); localStorage.setItem('fohConsole',state.console); }

function init(){
  populateFilters();
  populateConsoleSelectors();
  bindNavigation();
  bindDialogs();
  bindRta();
  bindCommunity();
  bindShows();
  bindInstall();
  renderPresets(); renderShows(); renderCommunity(); renderRingCuts();
  $('#versionText').textContent=APP_VERSION;
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  document.addEventListener('visibilitychange',()=>{ if(document.hidden && state.ring.running) stopRing(); });
}

function populateFilters(){
  const cats=[...new Set(presets.map(p=>p.category))].sort();
  $('#categoryFilter').innerHTML='<option value="all">All channels</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');
  $('#presetSearch').addEventListener('input',renderPresets); $('#categoryFilter').addEventListener('change',renderPresets);
}
function populateConsoleSelectors(){
  const html=Object.entries(consoleProfiles).map(([k,v])=>`<option value="${k}">${esc(v.name)}</option>`).join('');
  $('#consoleSelect').innerHTML=html; $('#consoleSelect').value=state.console;
  $('#consoleSelect').addEventListener('change',e=>{state.console=e.target.value;persist();toast(`Default: ${consoleProfiles[state.console].name}`);});
  $('#smoothingSelect').addEventListener('change',e=>{ if(state.rta.analyser) state.rta.analyser.smoothingTimeConstant=Number(e.target.value); });
}
function bindNavigation(){
  $$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>switchScreen(btn.dataset.nav)));
  $('#settingsBtn').addEventListener('click',()=>$('#settingsDialog').showModal());
}
function switchScreen(screen){
  state.screen=screen; $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===screen));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===screen));
  const kickers={presets:'Presets. RTA. Ring-out. Better mixes.',rta:'Live frequency analysis',ringout:'Feedback assistant',shows:'Your saved channel lists',community:'Approved engineer knowledge'};
  $('#screenKicker').textContent=kickers[screen]||'FOH Toolkit'; window.scrollTo({top:0,behavior:'smooth'});
}
function bindDialogs(){
  $$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.closeDialog).close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{ if(e.target===d) d.close(); }));
}

function renderPresets(){
  const q=$('#presetSearch').value.trim().toLowerCase(); const cat=$('#categoryFilter').value;
  const list=presets.filter(p=>(cat==='all'||p.category===cat)&&(!q||`${p.name} ${p.category} ${p.style} ${p.description}`.toLowerCase().includes(q)));
  $('#presetCount').textContent=`${list.length} preset${list.length===1?'':'s'}`;
  $('#presetGrid').innerHTML=list.map(p=>`<article class="preset-card" data-preset="${p.id}"><span class="verified">VERIFIED</span><div class="category-icon">${esc(p.icon)}</div><h4>${esc(p.name)}</h4><p>${esc(p.style)}</p></article>`).join('') || '<div class="empty-state" style="grid-column:1/-1">No matching presets.</div>';
  $$('[data-preset]').forEach(c=>c.addEventListener('click',()=>openPreset(c.dataset.preset)));
}
function openPreset(id){
  const p=presets.find(x=>x.id===id); if(!p)return;
  const c=consoleProfiles[state.console];
  $('#presetDetail').innerHTML=`
    <div class="detail-head"><span class="eyebrow">${esc(p.category.toUpperCase())}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p></div>
    <div class="detail-badges"><span class="badge verified-badge">✓ FOH TOOLKIT VERIFIED</span><span class="badge">${esc(p.style)}</span></div>
    <div class="console-bar"><label>TRANSLATE FOR</label><select id="detailConsole">${Object.entries(consoleProfiles).map(([k,v])=>`<option value="${k}" ${k===state.console?'selected':''}>${esc(v.name)}</option>`).join('')}</select></div>
    <div class="translation-note" id="translationNote">${esc(c.note)}</div>
    <div class="eq-card"><canvas id="eqCanvas" width="900" height="320"></canvas></div>
    <div class="processing-grid">
      <div class="processing-block"><h4>Filters & EQ</h4><div class="setting-list">
        <div class="setting"><span>HPF</span><strong>${p.hpf} Hz</strong></div><div class="setting"><span>LPF</span><strong>${p.lpf?fmtFreq(p.lpf):'Off'}</strong></div>
        ${p.eq.map((b,i)=>`<div class="setting"><span>Band ${i+1}</span><strong>${b.g>0?'+':''}${b.g} dB @ ${fmtFreq(b.f)} · Q ${b.q}</strong></div>`).join('')}
      </div></div>
      <div class="processing-block"><h4>Dynamics</h4><div class="setting-list">
        ${p.gate?Object.entries(p.gate).map(([k,v])=>`<div class="setting"><span>Gate ${esc(k)}</span><strong>${formatDyn(k,v)}</strong></div>`).join(''):'<div class="setting"><span>Gate</span><strong>Off</strong></div>'}
        ${p.comp?Object.entries(p.comp).map(([k,v])=>`<div class="setting"><span>Comp ${esc(k)}</span><strong>${formatDyn(k,v)}</strong></div>`).join(''):''}
      </div></div>
    </div>
    <div class="why-box"><strong>Why this works as a starting point</strong><br>${esc(p.why)}</div>
    <button class="primary full" id="addPresetToShow">Add to a show</button>
    <p class="helper">These are starting points, not rules. Gain structure, microphone, source, PA and room all change what the channel needs.</p>`;
  $('#presetDialog').showModal();
  requestAnimationFrame(()=>drawEqCurve($('#eqCanvas'),p));
  $('#detailConsole').addEventListener('change',e=>{state.console=e.target.value;$('#consoleSelect').value=state.console;$('#translationNote').textContent=consoleProfiles[state.console].note;persist();});
  $('#addPresetToShow').addEventListener('click',()=>chooseShowForPreset(p));
}
function formatDyn(k,v){ if(typeof v==='string')return v; if(['attack','hold','release'].includes(k))return `${v} ms`; if(['threshold','range','makeup'].includes(k))return `${v>0?'+':''}${v} dB`; return v; }
function drawEqCurve(canvas,p){
  if(!canvas)return; const dpr=Math.max(1,window.devicePixelRatio||1); const cssW=canvas.clientWidth||800, cssH=canvas.clientHeight||180; canvas.width=cssW*dpr;canvas.height=cssH*dpr; const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr); const w=cssW,h=cssH;
  ctx.clearRect(0,0,w,h); ctx.strokeStyle='#1f2930';ctx.lineWidth=1;
  [20,50,100,200,500,1000,2000,5000,10000,20000].forEach(f=>{const x=logX(f,w);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();});
  [-12,-6,0,6,12].forEach(db=>{const y=h/2-(db/18)*(h/2-14);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();});
  ctx.strokeStyle='#4bd4a0';ctx.lineWidth=2.5;ctx.beginPath();
  for(let x=0;x<w;x++){const f=20*Math.pow(1000,x/w); let db=0; p.eq.forEach(b=>{const oct=Math.log2(f/b.f);db+=b.g*Math.exp(-0.5*Math.pow(oct*(b.q*1.35),2));}); if(p.hpf&&f<p.hpf)db-=Math.min(18,Math.log2(p.hpf/f)*12); if(p.lpf&&f>p.lpf)db-=Math.min(18,Math.log2(f/p.lpf)*12); const y=clamp(h/2-(db/18)*(h/2-14),4,h-4); x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
}

function chooseShowForPreset(p){
  if(!state.shows.length){ const name=prompt('Name your first show','My Band'); if(!name)return; state.shows.push({id:crypto.randomUUID(),name,channels:[]}); }
  const choices=state.shows.map((s,i)=>`${i+1}. ${s.name}`).join('\n'); const result=prompt(`Add ${p.name} to which show?\n\n${choices}`,'1'); const idx=Number(result)-1; if(!state.shows[idx])return;
  state.shows[idx].channels.push({id:crypto.randomUUID(),presetId:p.id,name:p.name}); persist();renderShows();toast(`Added to ${state.shows[idx].name}`); $('#presetDialog').close();
}

function bindShows(){ $('#newShowBtn').addEventListener('click',()=>{const name=prompt('Show name','New Show');if(!name?.trim())return;state.shows.push({id:crypto.randomUUID(),name:name.trim(),channels:[]});persist();renderShows();openShow(state.shows.at(-1).id);}); }
function renderShows(){
  const el=$('#showsList'); if(!state.shows.length){el.className='list-stack empty-state';el.innerHTML='No shows yet. Create one, then add presets from the library.';return;} el.className='list-stack';
  el.innerHTML=state.shows.map(s=>`<button class="list-item" style="text-align:left;color:inherit" data-show="${s.id}"><div class="freq-chip">${s.channels.length} CH</div><div class="grow"><h4>${esc(s.name)}</h4><p>${s.channels.length?esc(s.channels.slice(0,3).map(c=>c.name).join(' · ')):'Empty show'}</p></div><span>›</span></button>`).join('');
  $$('[data-show]').forEach(b=>b.addEventListener('click',()=>openShow(b.dataset.show)));
}
function openShow(id){
  const s=state.shows.find(x=>x.id===id);if(!s)return;
  const render=()=>{
    $('#showDetail').innerHTML=`<div class="detail-head"><span class="eyebrow">MY SHOW</span><h2>${esc(s.name)}</h2><p>${s.channels.length} channel${s.channels.length===1?'':'s'} saved on this device.</p></div>
      <div class="list-stack">${s.channels.length?s.channels.map((c,i)=>`<div class="show-channel-row"><div class="ch-num">${i+1}</div><div><strong>${esc(c.name)}</strong><small>${esc((presets.find(p=>p.id===c.presetId)||{}).style||'Custom')}</small></div><button class="mini-btn" data-remove-channel="${c.id}">Remove</button></div>`).join(''):'<div class="empty-state">No channels yet. Add presets from the Presets tab.</div>'}</div>
      <div class="button-row"><button class="secondary" id="renameShow">Rename</button><button class="danger-button" id="deleteShow">Delete show</button></div>`;
    $$('[data-remove-channel]').forEach(b=>b.addEventListener('click',()=>{s.channels=s.channels.filter(c=>c.id!==b.dataset.removeChannel);persist();renderShows();render();}));
    $('#renameShow').addEventListener('click',()=>{const n=prompt('Show name',s.name);if(n?.trim()){s.name=n.trim();persist();renderShows();render();}});
    $('#deleteShow').addEventListener('click',()=>{if(confirm(`Delete ${s.name}?`)){state.shows=state.shows.filter(x=>x.id!==s.id);persist();renderShows();$('#showDialog').close();}});
  }; render(); $('#showDialog').showModal();
}

async function ensureAudio(deviceId=''){
  if(state.rta.stream) stopAudio();
  const constraints={audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1}}; if(deviceId) constraints.audio.deviceId={exact:deviceId};
  const stream=await navigator.mediaDevices.getUserMedia(constraints); const Ctx=window.AudioContext||window.webkitAudioContext; const context=new Ctx(); await context.resume(); const source=context.createMediaStreamSource(stream); const analyser=context.createAnalyser(); analyser.fftSize=4096; analyser.minDecibels=-110; analyser.maxDecibels=-10; analyser.smoothingTimeConstant=Number($('#smoothingSelect').value||.68); source.connect(analyser); state.rta={...state.rta,context,stream,source,analyser,data:new Float32Array(analyser.frequencyBinCount)}; await listInputs(); return analyser;
}
async function listInputs(){
  if(!navigator.mediaDevices?.enumerateDevices)return; const devices=await navigator.mediaDevices.enumerateDevices(); const current=$('#audioInput').value; const ins=devices.filter(d=>d.kind==='audioinput'); $('#audioInput').innerHTML=ins.map((d,i)=>`<option value="${d.deviceId}">${esc(d.label||`Audio input ${i+1}`)}</option>`).join('')||'<option value="">Default microphone</option>'; if(ins.some(d=>d.deviceId===current))$('#audioInput').value=current;
}
function stopAudio(){
  cancelAnimationFrame(state.rta.raf); state.rta.stream?.getTracks().forEach(t=>t.stop()); state.rta.context?.close().catch(()=>{}); state.rta={...state.rta,context:null,stream:null,source:null,analyser:null,data:null,raf:null,running:false};
}
function bindRta(){
  $('#startRtaBtn').addEventListener('click',startRta); $('#stopRtaBtn').addEventListener('click',stopRta); $('#audioInput').addEventListener('change',async()=>{if(state.rta.running){stopRta();await startRta();}});
}
async function startRta(){
  try{await ensureAudio($('#audioInput').value);state.rta.running=true;$('#startRtaBtn').disabled=true;$('#stopRtaBtn').disabled=false;drawRta();}
  catch(e){toast('Microphone permission is required for the RTA.');}
}
function stopRta(){stopAudio();$('#startRtaBtn').disabled=false;$('#stopRtaBtn').disabled=true;$('#rtaPeak').textContent='— Hz';$('#rtaLevel').textContent='— dB';drawEmptyRta();}
function drawEmptyRta(){const c=$('#rtaCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}
function drawRta(){
  if(!state.rta.running||!state.rta.analyser)return; const a=state.rta.analyser,d=state.rta.data;a.getFloatFrequencyData(d); const sampleRate=state.rta.context.sampleRate; const binHz=sampleRate/a.fftSize; let best=-999,bestF=0;
  for(let i=Math.ceil(40/binHz);i<Math.min(d.length,Math.floor(18000/binHz));i++){if(d[i]>best){best=d[i];bestF=i*binHz;}}
  $('#rtaPeak').textContent=fmtFreq(bestF);$('#rtaLevel').textContent=`${Math.round(best)} dB`;
  const c=$('#rtaCanvas'),dpr=Math.max(1,window.devicePixelRatio||1),w=c.clientWidth||900,h=c.clientHeight||260;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=w*dpr;c.height=h*dpr;} const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#070a0c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#182128';ctx.lineWidth=1;[20,50,100,200,500,1000,2000,5000,10000,20000].forEach(f=>{const x=logX(f,w);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();});[-100,-80,-60,-40,-20].forEach(db=>{const y=(1-(db+110)/100)*h;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();});
  ctx.strokeStyle='#4bd4a0';ctx.lineWidth=2;ctx.beginPath(); let started=false; for(let i=1;i<d.length;i++){const f=i*binHz;if(f<20||f>20000)continue;const x=logX(f,w);const y=clamp((1-(d[i]+110)/100)*h,0,h);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}ctx.stroke();
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(75,212,160,.16)');grad.addColorStop(1,'rgba(75,212,160,0)');ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle=grad;ctx.fill(); state.rta.raf=requestAnimationFrame(drawRta);
}

$('#startRingBtn').addEventListener('click',startRing);$('#stopRingBtn').addEventListener('click',stopRing);$('#saveRingBtn').addEventListener('click',()=>{if(!state.ring.current)return;state.ringCuts.push({...state.ring.current,id:crypto.randomUUID()});renderRingCuts();toast('Suggested cut saved');});$('#clearRingBtn').addEventListener('click',()=>{state.ringCuts=[];renderRingCuts();});
async function startRing(){
  try{if(state.rta.running)stopRta();await ensureAudio($('#audioInput').value);state.ring.running=true;state.ring.lastCandidate=null;state.ring.stableSince=0;$('#startRingBtn').disabled=true;$('#stopRingBtn').disabled=false;$('#ringStatusDot').className='status-dot listening';$('#ringStatus').textContent='LISTENING';$('#ringMessage').textContent='Bring the monitor level up slowly. Watching for a persistent narrow peak…';analyseRing();}
  catch(e){toast('Microphone permission is required for Ring Out.');}
}
function stopRing(){state.ring.running=false;stopAudio();$('#startRingBtn').disabled=false;$('#stopRingBtn').disabled=true;$('#ringStatusDot').className='status-dot';$('#ringStatus').textContent='READY';$('#ringMessage').textContent='Start listening, then bring the monitor up gradually.';}
function analyseRing(){
  if(!state.ring.running||!state.rta.analyser)return;const a=state.rta.analyser,d=state.rta.data;a.getFloatFrequencyData(d);const binHz=state.rta.context.sampleRate/a.fftSize;let best={score:-999,i:0,db:-999};
  const lo=Math.ceil(100/binHz),hi=Math.min(d.length-12,Math.floor(12000/binHz));
  for(let i=lo+12;i<hi;i++){
    const db=d[i]; if(db<-65)continue; let sum=0,n=0; for(let k=6;k<=22;k+=2){if(i-k>=0){sum+=d[i-k];n++;}if(i+k<d.length){sum+=d[i+k];n++;}} const local=sum/n; const score=db-local; if(score>best.score)best={score,i,db,local};
  }
  const freq=best.i*binHz; const isCandidate=best.score>7.5&&best.db>-60;
  if(isCandidate){
    const close=state.ring.lastCandidate&&Math.abs(Math.log2(freq/state.ring.lastCandidate))<0.045;
    if(!close){state.ring.lastCandidate=freq;state.ring.stableSince=performance.now();}
    const held=performance.now()-state.ring.stableSince;
    if(held>420){const snapped=smartEqFreq(freq);const severity=clamp(Math.round((best.score-6)/2),3,6);const q=best.score>13?8:best.score>10?6:5; state.ring.current={frequency:snapped,rawFrequency:freq,cut:-severity,q,confidence:Math.round(clamp((best.score/16)*100,55,99))};showRingDetection(state.ring.current);}
    else showRingWatching(freq,held/420);
  }else{state.ring.lastCandidate=null;state.ring.stableSince=0;if(!state.ring.current)showRingIdle();}
  state.rta.raf=requestAnimationFrame(analyseRing);
}
function smartEqFreq(f){const common=[100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500];let b=common[0];common.forEach(x=>{if(Math.abs(Math.log(f/x))<Math.abs(Math.log(f/b)))b=x;});return Math.abs(f-b)/f<.07?b:Math.round(f/10)*10;}
function showRingWatching(f,p){$('#ringStatusDot').className='status-dot listening';$('#ringStatus').textContent='CHECKING PEAK';$('#ringFrequency').textContent=fmtFreq(f);$('#ringMessage').textContent=`Possible ringing frequency — confirming persistence ${Math.round(p*100)}%`;$('#saveRingBtn').disabled=true;}
function showRingIdle(){ $('#ringFrequency').textContent='—';$('#suggestFreq').textContent='—';$('#suggestCut').textContent='—';$('#suggestQ').textContent='—';$('#saveRingBtn').disabled=true; }
function showRingDetection(x){$('#ringStatusDot').className='status-dot alert';$('#ringStatus').textContent='FEEDBACK LIKELY';$('#ringFrequency').textContent=fmtFreq(x.frequency);$('#ringMessage').textContent=`Persistent narrow peak detected · confidence ${x.confidence}%`;$('#suggestFreq').textContent=fmtFreq(x.frequency);$('#suggestCut').textContent=`${x.cut} dB`;$('#suggestQ').textContent=x.q.toFixed(1);$('#saveRingBtn').disabled=false;}
function renderRingCuts(){const el=$('#ringCuts');if(!state.ringCuts.length){el.className='list-stack empty-state';el.textContent='No cuts saved yet.';return;}el.className='list-stack';el.innerHTML=state.ringCuts.map((x,i)=>`<div class="list-item"><div class="freq-chip">${fmtFreq(x.frequency)}</div><div class="grow"><h4>${x.cut} dB · Q ${x.q.toFixed(1)}</h4><p>Suggested corrective EQ #${i+1} · ${x.confidence}% confidence</p></div><button class="mini-btn" data-cut-remove="${x.id}">Remove</button></div>`).join('');$$('[data-cut-remove]').forEach(b=>b.addEventListener('click',()=>{state.ringCuts=state.ringCuts.filter(x=>x.id!==b.dataset.cutRemove);renderRingCuts();}));}

function bindCommunity(){
  $$('[data-community-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-community-tab]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-community-pane]').forEach(p=>p.classList.toggle('active',p.dataset.communityPane===b.dataset.communityTab));renderCommunity();}));
  $('#communityForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);state.submissions.unshift({id:crypto.randomUUID(),name:fd.get('name'),category:fd.get('category'),style:fd.get('style'),description:fd.get('description'),settings:fd.get('settings'),status:'pending',submittedAt:new Date().toISOString()});persist();e.currentTarget.reset();renderCommunity();toast('Submitted to review queue');document.querySelector('[data-community-tab="review"]').click();});
}
function renderCommunity(){
  $('#communityApproved').innerHTML=[...seededCommunity,...state.submissions.filter(x=>x.status==='approved').map(x=>({...x,author:'Community engineer',rating:5,ratings:1}))].map(p=>`<article class="preset-card"><span class="verified">APPROVED</span><div class="category-icon">C</div><h4>${esc(p.name)}</h4><p>${esc(p.category)} · ${esc(p.style)}</p><p style="margin-top:8px;color:#d0d6da">★ ${p.rating.toFixed(1)} <span style="color:var(--dim)">(${p.ratings})</span></p></article>`).join('');
  const pending=state.submissions.filter(x=>x.status==='pending'); const el=$('#reviewQueue'); if(!pending.length){el.className='list-stack empty-state';el.textContent='No pending submissions on this device.';return;}el.className='list-stack';el.innerHTML=pending.map(x=>`<div class="panel"><span class="eyebrow">PENDING · ${esc(x.category)}</span><h3 style="margin:6px 0">${esc(x.name)}</h3><p style="color:var(--muted);font-size:11px;line-height:1.5">${esc(x.description)}</p><pre style="white-space:pre-wrap;color:#c8d0d5;background:#090d10;padding:10px;border-radius:10px;font-size:10px">${esc(x.settings)}</pre><div class="button-row"><button class="primary" data-approve="${x.id}">Approve</button><button class="danger-button" data-reject="${x.id}">Reject</button></div></div>`).join('');
  $$('[data-approve]').forEach(b=>b.addEventListener('click',()=>moderate(b.dataset.approve,'approved')));$$('[data-reject]').forEach(b=>b.addEventListener('click',()=>moderate(b.dataset.reject,'rejected')));
}
function moderate(id,status){const x=state.submissions.find(s=>s.id===id);if(!x)return;x.status=status;persist();renderCommunity();toast(status==='approved'?'Preset approved':'Preset rejected');}

function bindInstall(){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;$('#installBtn').hidden=false;});
  $('#installBtn').addEventListener('click',async()=>{if(state.deferredInstall){state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$('#installBtn').hidden=true;}else toast('On iPhone: Share → Add to Home Screen');});
}

window.addEventListener('resize',()=>{const p=$('#presetDialog').open&&$('#presetDetail'); if(p){const canvas=$('#eqCanvas');const id=$('#addPresetToShow')?.dataset?.presetId;if(canvas&&id)drawEqCurve(canvas,presets.find(x=>x.id===id));}});
window.addEventListener('DOMContentLoaded',init);
