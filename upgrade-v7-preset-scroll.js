/* FOH Toolkit Prototype 1.5.4 — preset sheet top/focus reset */
(function(){
  'use strict';

  function focusPresetHeading(){
    const dialog=document.getElementById('presetDialog');
    const heading=document.querySelector('#presetDetail .detail-head h2');
    if(!dialog||!dialog.open)return;

    // iOS was auto-focusing the first visible control inside the dialog.
    // Because the per-preset console selector is hidden, that control is the
    // "Add to a show" button near the bottom, which made the sheet open there.
    // Move focus to the preset heading instead, then explicitly reset scroll.
    if(heading){
      heading.setAttribute('tabindex','-1');
      try{heading.focus({preventScroll:true});}catch(_e){heading.focus();}
    }else{
      dialog.setAttribute('tabindex','-1');
      try{dialog.focus({preventScroll:true});}catch(_e){dialog.focus();}
    }

    dialog.scrollTop=0;
  }

  function resetPresetScroll(){
    const dialog=document.getElementById('presetDialog');
    if(!dialog)return;
    dialog.scrollTop=0;
  }

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('[data-preset]'))return;

    // The preset's own card handler has already rendered/opened the dialog by
    // the time this bubbling handler runs. Correct focus immediately, then
    // repeat after paint so Safari cannot scroll back to the bottom control.
    focusPresetHeading();
    requestAnimationFrame(()=>{
      focusPresetHeading();
      requestAnimationFrame(()=>{
        focusPresetHeading();
        resetPresetScroll();
      });
    });
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const dialog=document.getElementById('presetDialog');
    if(dialog)dialog.addEventListener('close',resetPresetScroll);
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version)version.textContent='Prototype 1.5.4';
    },0);
  });
})();
