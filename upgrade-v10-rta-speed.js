/* FOH Toolkit Prototype 1.7.2 — adjustable RTA display speed */
(function(){
  'use strict';

  const SPEED_KEY='fohRtaDisplaySpeed';
  const SPEEDS={
    fast:{label:'Fast · 20 updates/sec',fps:20},
    normal:{label:'Normal · 12 updates/sec',fps:12},
    slow:{label:'Slow · 7 updates/sec',fps:7},
    veryslow:{label:'Very slow · 4 updates/sec',fps:4}
  };

  let lastDraw=0;

  function currentSpeed(){
    const key=localStorage.getItem(SPEED_KEY)||'slow';
    return SPEEDS[key]?key:'slow';
  }

  function currentFps(){return SPEEDS[currentSpeed()].fps;}

  function installControl(){
    if(document.getElementById('rtaSpeedSelect'))return;
    const panel=document.querySelector('#screen-rta .controls-panel');
    if(!panel)return;
    const buttons=panel.querySelector('.button-row');
    const row=document.createElement('div');
    row.className='field-row';
    row.id='rtaSpeedRow';
    row.innerHTML=`<label for="rtaSpeedSelect">RTA display speed</label><select id="rtaSpeedSelect">${Object.entries(SPEEDS).map(([key,v])=>`<option value="${key}" ${key===currentSpeed()?'selected':''}>${v.label}</option>`).join('')}</select>`;
    if(buttons)panel.insertBefore(row,buttons);else panel.appendChild(row);

    const helper=document.createElement('p');
    helper.className='helper';
    helper.id='rtaSpeedHelp';
    helper.textContent='Slow is the default so the trace is easier to read. This only slows the RTA display — Ring Out detection still runs at full speed.';
    row.insertAdjacentElement('afterend',helper);

    row.querySelector('select').addEventListener('change',e=>{
      localStorage.setItem(SPEED_KEY,e.target.value);
      lastDraw=0;
      const selected=SPEEDS[e.target.value];
      if(typeof toast==='function')toast(`RTA display: ${selected?.label||'updated'}`);
    });
  }

  // The original analyser drew on every browser animation frame (~60 fps).
  // Keep the analyser itself untouched and throttle only the visual redraw.
  // That means Ring Out remains responsive and microphone analysis is not slowed.
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

  function ready(){
    installControl();
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version)version.textContent='Prototype 1.7.2';
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
