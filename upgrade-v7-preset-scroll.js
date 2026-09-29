/* FOH Toolkit Prototype 1.5.3 — preset sheet scroll reset */
(function(){
  'use strict';

  function resetPresetScroll(){
    const dialog=document.getElementById('presetDialog');
    const detail=document.getElementById('presetDetail');
    if(!dialog)return;
    dialog.scrollTop=0;
    if(detail)detail.scrollTop=0;
  }

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('[data-preset]'))return;
    // The preset's own click handler opens the sheet first. Reset immediately
    // afterwards and again on the next paint so iOS cannot restore the previous
    // scroll position from the last preset that was viewed.
    resetPresetScroll();
    requestAnimationFrame(()=>{
      resetPresetScroll();
      requestAnimationFrame(resetPresetScroll);
    });
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const dialog=document.getElementById('presetDialog');
    if(dialog)dialog.addEventListener('close',resetPresetScroll);
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version)version.textContent='Prototype 1.5.3';
    },0);
  });
})();
