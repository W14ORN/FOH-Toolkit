/* FOH Toolkit Prototype 1.5.2 — persistent console selection */
(function(){
  'use strict';

  const SESSION_KEY='fohSessionConsole';
  const SAVED_KEY='fohConsole';

  // Carry the last selected console into each new browser/PWA session before
  // the v1.2 desk-selection code runs. This means the automatic desk picker
  // appears only for a user who has never chosen a desk before.
  try{
    const saved=localStorage.getItem(SAVED_KEY);
    if(saved && !sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY,saved);
  }catch(_e){}

  // Do not touch preset-detail DOM at all here. Earlier versions used a
  // MutationObserver to hide the per-preset selector, which could interfere
  // with opening the preset sheet on iOS. The selector is now hidden purely
  // with CSS so the original preset open/render/listener code is untouched.
  document.addEventListener('DOMContentLoaded',()=>{
    const settingsLabel=document.querySelector('label[for="consoleSelect"]');
    if(settingsLabel) settingsLabel.textContent='Saved console';
    setTimeout(()=>{
      const version=document.getElementById('versionText');
      if(version) version.textContent='Prototype 1.5.2';
    },0);
  });
})();
