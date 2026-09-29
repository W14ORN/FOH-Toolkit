/* FOH Toolkit Prototype 1.5 — persistent console selection */
(function(){
  'use strict';

  const SESSION_KEY='fohSessionConsole';
  const SAVED_KEY='fohConsole';

  // Carry the last selected console into each new browser/PWA session before
  // the v1.2 desk-selection code runs. The desk picker therefore appears only
  // when no console has ever been selected, or when the user opens it manually.
  try{
    const saved=localStorage.getItem(SAVED_KEY);
    if(saved && !sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY,saved);
  }catch(_e){}

  function currentDeskLabel(select){
    const option=select?.options?.[select.selectedIndex];
    return option?.textContent?.trim()||'saved console';
  }

  function simplifyPresetDeskUI(){
    const detail=document.getElementById('presetDetail');
    const select=document.getElementById('detailConsole');
    if(!detail||!select)return;

    // Presets always inherit the saved/current console. Keep the underlying
    // select in the DOM so the existing translation code remains untouched,
    // but stop asking the engineer to choose it on every preset.
    const row=select.closest('.field-row, .field, .detail-field, .console-field')||select.parentElement;
    if(row) row.hidden=true;
    else select.hidden=true;

    let note=detail.querySelector('.preset-saved-desk-note');
    if(!note){
      note=document.createElement('div');
      note.className='programming-status preset-saved-desk-note';
      const head=detail.querySelector('.detail-head');
      if(head) head.insertAdjacentElement('afterend',note);
      else detail.prepend(note);
    }
    note.innerHTML=`<strong>USING SAVED DESK</strong><span>${currentDeskLabel(select)} · change console from the desk button or Settings only when needed.</span>`;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const detail=document.getElementById('presetDetail');
    if(detail){
      new MutationObserver(()=>simplifyPresetDeskUI()).observe(detail,{childList:true,subtree:true});
      simplifyPresetDeskUI();
    }

    const settingsLabel=document.querySelector('label[for="consoleSelect"]');
    if(settingsLabel)settingsLabel.textContent='Saved console';

    // Run after the earlier upgrade scripts have written their version labels.
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version)version.textContent='Prototype 1.5.0';
    },0);
  });
})();
