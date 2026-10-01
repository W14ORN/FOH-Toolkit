/* FOH Toolkit 3.0 — RTA Pro */
(function(){
  'use strict';
  const CAL_KEY='fohRtaCalibration';
  const OFFSET_KEY='fohRtaSplOffset';
  const TARGET_KEY='fohRtaTarget';
  let frozen=false,peakHoldOn=false,view='spectrum',hold=null,snapshot=null,lastDraw=0,lastSpectrum=null,lastPeaks=[];
  let calibration=parseStoredCal();

  function parseStoredCal(){try{return JSON.parse(localStorage.getItem(CAL_KEY)||'[]');}catch(_e){return [];}}
  function fps(){const n=Number(localStorage.getItem('fohRtaDisplaySpeed')||7);return Math.max(2,Math.min(30,Number.isFinite(n)?n:7));}
  function splOffset(){return Number(localStorage.getItem(OFFSET_KEY)||0)||0;}
  function target(){return localStorage.getItem(TARGET_KEY)||'off';}
  function corrAt(f){if(!calibration.length)return 0;if(f<=calibration[0][0])return calibration[0][1];if(f>=calibration.at(-1)[0])return calibration.at(-1)[1];let lo=0,hi=calibration.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(calibration[m][0]<=f)lo=m;else hi=m;}const a=calibration[lo],b=calibration[hi],x=(Math.log(f)-Math.log(a[0]))/(Math.log(b[0])-Math.log(a[0]));return a[1]+(b[1]-a[1])*x;}
  function correctedData(){const a=state.rta.analyser,d=state.rta.data;if(!a||!d)return null;a.getFloatFrequencyData(d);const binHz=state.rta.context.sampleRate/a.fftSize;const out=new Float32Array(d.length);for(let i=0;i<d.length;i++)out[i]=d[i]+corrAt(Math.max(1,i*binHz));return {data:out,binHz};}
  function detectPeaks(data,binHz){const peaks=[];const lo=Math.ceil(40/binHz),hi=Math.min(data.length-2,Math.floor(18000/binHz));for(let i=lo+2;i<hi-2;i++){const db=data[i];if(db<-85)continue;if(db>data[i-1]&&db>data[i+1]&&db>data[i-2]&&db>data[i+2])peaks.push({f:i*binHz,db});}peaks.sort((a,b)=>b.db-a.db);const out=[];for(const p of peaks){if(out.every(x=>Math.abs(Math.log2(p.f/x.f))>.08)){out.push(p);if(out.length===3)break;}}return out;}
  function thirdBands(data,binHz){const bands=[];for(let c=25;c<=16000;c*=Math.pow(2,1/3)){const low=c/Math.pow(2,1/6),high=c*Math.pow(2,1/6);let sum=0,n=0;for(let i=Math.max(1,Math.ceil(low/binHz));i<Math.min(data.length,Math.floor(high/binHz));i++){sum+=Math.pow(10,data[i]/10);n++;}if(n)bands.push({f:c,db:10*Math.log10(sum/n)});}return bands;}
  function targetDb(f,type){if(type==='flat')return -50;if(type==='live')return -48-3*Math.log2(Math.max(80,f)/1000);if(type==='speech'){let v=-50;if(f<120)v-=Math.min(18,12*Math.log2(120/f));if(f>8000)v-=Math.min(12,6*Math.log2(f/8000));return v;}return null;}

  function canvasSetup(){const c=document.getElementById('rtaCanvas');if(!c)return null;const dpr=Math.max(1,window.devicePixelRatio||1),w=c.clientWidth||900,h=c.clientHeight||260;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#070a0c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#1c252b';ctx.lineWidth=1;[20,50,100,200,500,1000,2000,5000,10000,20000].forEach(f=>{const x=logX(f,w);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();});[-90,-70,-50,-30,-10].forEach(db=>{const y=(1-(db+110)/100)*h;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();});return {c,ctx,w,h};}
  function yFor(db,h){return clamp((1-(db+110)/100)*h,0,h);}
  function drawLine(ctx,w,h,data,binHz,stroke,width=2,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.beginPath();let started=false;for(let i=1;i<data.length;i++){const f=i*binHz;if(f<20||f>20000)continue;const x=logX(f,w),y=yFor(data[i],h);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}ctx.stroke();ctx.restore();}
  function drawTarget(ctx,w,h){const t=target();if(t==='off')return;ctx.save();ctx.strokeStyle='rgba(242,201,76,.75)';ctx.setLineDash([7,5]);ctx.lineWidth=1.5;ctx.beginPath();for(let x=0;x<w;x++){const f=20*Math.pow(1000,x/w),db=targetDb(f,t),y=yFor(db,h);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();}
  function drawThird(ctx,w,h,data,binHz){const bands=thirdBands(data,binHz);bands.forEach((b,i)=>{const next=bands[i+1]?.f||b.f*Math.pow(2,1/3),x1=logX(b.f/Math.pow(2,1/6),w),x2=logX(next/Math.pow(2,1/6),w),y=yFor(b.db,h);ctx.fillStyle='rgba(75,212,160,.72)';ctx.fillRect(x1+1,y,Math.max(1,x2-x1-2),h-y);});}
  function drawSnapshot(ctx,w,h,binHz){if(snapshot&&snapshot.length)drawLine(ctx,w,h,snapshot,binHz,'rgba(79,168,255,.9)',1.5,.9);}
  function updateHold(data){if(!peakHoldOn)return;if(!hold||hold.length!==data.length){hold=new Float32Array(data.length);hold.fill(-120);}for(let i=0;i<data.length;i++)if(data[i]>hold[i])hold[i]=data[i];}
  function updateMetrics(peaks){lastPeaks=peaks;const top=peaks[0];const peakEl=document.getElementById('rtaPeak'),levelEl=document.getElementById('rtaLevel');if(top&&peakEl)peakEl.textContent=fmtFreq(top.f);if(top&&levelEl){const off=splOffset();levelEl.textContent=off?`${Math.round(top.db+off)} dB SPL*`:`${Math.round(top.db)} dB`;}
    const list=document.getElementById('v3TopPeaks');if(list)list.innerHTML=peaks.length?peaks.map((p,i)=>`<div><span>${i+1}</span><strong>${fmtFreq(p.f)}</strong><small>${Math.round(p.db)} dB</small></div>`).join(''):'<div class="helper">No strong peaks yet.</div>';
    const save=document.getElementById('v3SendPeak');if(save)save.disabled=!top;
  }

  window.drawRta=drawRta=function(){
    if(!state?.rta?.running||!state.rta.analyser)return;
    const now=performance.now(),interval=1000/fps();if(now-lastDraw<interval){state.rta.raf=requestAnimationFrame(drawRta);return;}lastDraw=now;
    if(frozen){state.rta.raf=requestAnimationFrame(drawRta);return;}
    const pack=correctedData();if(!pack){state.rta.raf=requestAnimationFrame(drawRta);return;}lastSpectrum=pack.data;updateHold(pack.data);const peaks=detectPeaks(pack.data,pack.binHz),cv=canvasSetup();if(!cv){state.rta.raf=requestAnimationFrame(drawRta);return;}drawTarget(cv.ctx,cv.w,cv.h);drawSnapshot(cv.ctx,cv.w,cv.h,pack.binHz);if(view==='third')drawThird(cv.ctx,cv.w,cv.h,pack.data,pack.binHz);else drawLine(cv.ctx,cv.w,cv.h,pack.data,pack.binHz,'#4bd4a0',2);if(peakHoldOn&&hold)drawLine(cv.ctx,cv.w,cv.h,hold,pack.binHz,'rgba(255,122,89,.8)',1.2,.9);updateMetrics(peaks);state.rta.raf=requestAnimationFrame(drawRta);
  };

  function ensureControls(){
    const screen=document.getElementById('screen-rta'),controls=screen?.querySelector('.controls-panel');if(!screen||!controls||document.getElementById('v3RtaTools'))return;
    const panel=document.createElement('div');panel.id='v3RtaTools';panel.className='panel v3-rta-tools';panel.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">RTA PRO</span><h3>Analysis tools</h3></div><span class="count-pill" id="v3RtaState">LIVE</span></div><div class="v3-rta-actions"><button class="secondary" id="v3Freeze">Freeze</button><button class="secondary" id="v3Snapshot">Snapshot</button><button class="secondary" id="v3PeakHold">Peak hold</button><button class="secondary" id="v3ResetHold">Reset hold</button></div><div class="two-col"><div class="field"><label for="v3RtaView">Display</label><select id="v3RtaView"><option value="spectrum">Spectrum</option><option value="third">1/3 octave</option></select></div><div class="field"><label for="v3RtaTarget">Reference overlay</label><select id="v3RtaTarget"><option value="off">Off</option><option value="flat">Flat guide</option><option value="live">Live PA tilt</option><option value="speech">Speech guide</option></select></div></div><div class="v3-top-peaks"><span class="eyebrow">TOP 3 PEAKS</span><div id="v3TopPeaks"></div><button class="primary full" id="v3SendPeak" disabled>Send strongest peak to Ring Out</button></div><div class="v3-calibration"><span class="eyebrow">MEASUREMENT MIC</span><div class="two-col"><div class="field"><label for="v3SplOffset">SPL display offset</label><input id="v3SplOffset" type="number" step="0.1" min="-100" max="200" value="${splOffset()}"></div><div class="field"><label for="v3CalFile">Mic calibration file</label><input id="v3CalFile" type="file" accept=".txt,.cal,.csv,text/plain"></div></div><div class="button-row"><button class="ghost" id="v3ClearCal" type="button">Clear mic calibration</button></div><p class="helper" id="v3CalStatus">${calibration.length?`${calibration.length} calibration points loaded.`:'No mic response calibration loaded.'} SPL remains an estimate unless you set the offset against a known SPL reference.</p></div>`;
    controls.insertAdjacentElement('afterend',panel);
    document.getElementById('v3RtaTarget').value=target();bindControls();
  }
  function bindControls(){
    document.getElementById('v3Freeze')?.addEventListener('click',e=>{frozen=!frozen;e.currentTarget.classList.toggle('active',frozen);e.currentTarget.textContent=frozen?'Unfreeze':'Freeze';const s=document.getElementById('v3RtaState');if(s)s.textContent=frozen?'FROZEN':'LIVE';});
    document.getElementById('v3Snapshot')?.addEventListener('click',()=>{if(!lastSpectrum)return toast('Start the RTA first');snapshot=new Float32Array(lastSpectrum);toast('RTA snapshot saved');});
    document.getElementById('v3PeakHold')?.addEventListener('click',e=>{peakHoldOn=!peakHoldOn;e.currentTarget.classList.toggle('active',peakHoldOn);if(peakHoldOn&&!hold&&lastSpectrum){hold=new Float32Array(lastSpectrum);}toast(peakHoldOn?'Peak hold on':'Peak hold off');});
    document.getElementById('v3ResetHold')?.addEventListener('click',()=>{hold=null;toast('Peak hold reset');});
    document.getElementById('v3RtaView')?.addEventListener('change',e=>{view=e.target.value;lastDraw=0;});
    document.getElementById('v3RtaTarget')?.addEventListener('change',e=>{localStorage.setItem(TARGET_KEY,e.target.value);lastDraw=0;});
    document.getElementById('v3SplOffset')?.addEventListener('change',e=>{localStorage.setItem(OFFSET_KEY,String(Number(e.target.value)||0));});
    document.getElementById('v3SendPeak')?.addEventListener('click',()=>{const p=lastPeaks[0];if(!p)return;window.dispatchEvent(new CustomEvent('foh-rta-save-peak',{detail:{frequency:p.f,level:p.db}}));toast(`Sent ${fmtFreq(p.f)} to Ring Out`);});
    document.getElementById('v3CalFile')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const text=await file.text(),points=[];text.split(/\r?\n/).forEach(line=>{const clean=line.trim();if(!clean||/^[*#;]/.test(clean))return;const parts=clean.split(/[\s,;]+/).map(Number);if(Number.isFinite(parts[0])&&Number.isFinite(parts[1])&&parts[0]>=10&&parts[0]<=30000)points.push([parts[0],parts[1]]);});points.sort((a,b)=>a[0]-b[0]);if(points.length<3)throw new Error('Not enough frequency/correction rows');calibration=points;localStorage.setItem(CAL_KEY,JSON.stringify(points));document.getElementById('v3CalStatus').textContent=`${points.length} calibration points loaded from ${file.name}.`;toast('Mic calibration loaded');}catch(err){toast('Could not read calibration file');console.warn(err);}});
    document.getElementById('v3ClearCal')?.addEventListener('click',()=>{calibration=[];localStorage.removeItem(CAL_KEY);const s=document.getElementById('v3CalStatus');if(s)s.textContent='No mic response calibration loaded.';toast('Mic calibration cleared');});
  }
  function ready(){ensureControls();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();
