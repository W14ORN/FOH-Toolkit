/* FOH Toolkit Prototype 2.0 — adjustable RTA display speed slider */
(function(){
  'use strict';

  const SPEED_KEY='fohRtaDisplaySpeed';
  const LEGACY_SPEEDS={fast:20,normal:12,slow:7,veryslow:4};
  const MIN_FPS=2;
  const MAX_FPS=30;
  const DEFAULT_FPS=7;
  let lastDraw=0;

  function storedFps(){
    const raw=localStorage.getItem(SPEED_KEY);
    if(raw in LEGACY_SPEEDS){
      const fps=LEGACY_SPEEDS[raw];
      localStorage.setItem(SPEED_KEY,String(fps));
      return fps;
    }
    const n=Number(raw);
    return Number.isFinite(n)?Math.max(MIN_FPS,Math.min(MAX_FPS,Math.round(n))):DEFAULT_FPS;
  }

  function currentFps(){return storedFps();}

  function speedWord(fps){
    if(fps<=4)return 'Very slow';
    if(fps<=8)return 'Slow';
    if(fps<=14)return 'Medium';
    if(fps<=22)return 'Fast';
    return 'Very fast';
  }

  function installControl(){
    const old=document.getElementById('rtaSpeedRow');
    if(old)old.remove();
    const oldHelp=document.getElementById('rtaSpeedHelp');
    if(oldHelp)oldHelp.remove();

    const panel=document.querySelector('#screen-rta .controls-panel');
    if(!panel)return;
    const buttons=panel.querySelector('.button-row');
    const fps=currentFps();
    const row=document.createElement('div');
    row.className='field-row';
    row.id='rtaSpeedRow';
    row.style.display='block';
    row.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px">
        <label for="rtaSpeedSlider">RTA display speed</label>
        <strong id="rtaSpeedValue" style="white-space:nowrap">${fps} updates/sec</strong>
      </div>
      <input id="rtaSpeedSlider" type="range" min="${MIN_FPS}" max="${MAX_FPS}" step="1" value="${fps}" style="width:100%" aria-label="RTA display speed" />
      <div style="display:flex;justify-content:space-between;margin-top:4px;color:var(--dim);font-size:10px"><span>Slower</span><span id="rtaSpeedWord">${speedWord(fps)}</span><span>Faster</span></div>`;
    if(buttons)panel.insertBefore(row,buttons);else panel.appendChild(row);

    const helper=document.createElement('p');
    helper.className='helper';
    helper.id='rtaSpeedHelp';
    helper.textContent='Slide left for a steadier, easier-to-read trace or right for a faster response. Ring Out detection is not slowed down.';
    row.insertAdjacentElement('afterend',helper);

    const slider=row.querySelector('#rtaSpeedSlider');
    const value=row.querySelector('#rtaSpeedValue');
    const word=row.querySelector('#rtaSpeedWord');
    slider.addEventListener('input',e=>{
      const fps=Number(e.target.value);
      localStorage.setItem(SPEED_KEY,String(fps));
      value.textContent=`${fps} updates/sec`;
      word.textContent=speedWord(fps);
      lastDraw=0;
    });
    slider.addEventListener('change',e=>{
      const fps=Number(e.target.value);
      if(typeof toast==='function')toast(`RTA: ${speedWord(fps)} · ${fps}/sec`);
    });
  }

  if(typeof drawRta==='function'&&!drawRta._fohSpeedWrapped){
    const originalDrawRta=drawRta;
    const wrapped=function(){
      if(!state?.rta?.running||!state?.rta?.analyser){
        return originalDrawRta();
      }
      const now=performance.now();
      const interval=1000/currentFps();
      if(lastDraw&&now-lastDraw<interval){
        state.rta.raf=requestAnimationFrame(wrapped);
        return;
      }
      lastDraw=now;
      return originalDrawRta();
    };
    wrapped._fohSpeedWrapped=true;
    drawRta=wrapped;
  }

  function loadV13(){
    if(document.querySelector('script[data-foh-v13]'))return;
    const s=document.createElement('script');
    s.src='upgrade-v13-community.js';
    s.dataset.fohV13='1';
    document.head.appendChild(s);
  }

  function loadV12(){
    const existing=document.querySelector('script[data-foh-v12]');
    if(existing){
      if(document.getElementById('screen-profile'))loadV13();
      else existing.addEventListener('load',loadV13,{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src='upgrade-v12-profile.js';
    s.dataset.fohV12='1';
    s.onload=loadV13;
    document.head.appendChild(s);
  }

  function loadV11(){
    const existing=document.querySelector('script[data-foh-v11]');
    if(existing){
      if(document.getElementById('fohAuthGate'))loadV12();
      else existing.addEventListener('load',loadV12,{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src='upgrade-v11-auth-sync.js';
    s.dataset.fohV11='1';
    s.onload=loadV12;
    document.head.appendChild(s);
  }

  function ready(){
    installControl();
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version)version.textContent='Prototype 2.0.0';
    },250);
    loadV11();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
