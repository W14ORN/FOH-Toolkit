/* FOH Toolkit Prototype 2.0.1 — profile stability hotfix */
(function(){
  'use strict';

  let observer=null;
  let savedRolePanel=null;

  function syncVersion(){
    const globalVersion=document.getElementById('versionText');
    if(globalVersion)globalVersion.textContent='Prototype 2.0.1';
    const profileVersion=document.querySelector('#fohProfileBody .profile-about .profile-stat-row strong');
    if(profileVersion)profileVersion.textContent='Prototype 2.0.1';
  }

  function install(){
    const body=document.getElementById('fohProfileBody');
    if(!body||observer)return;

    const capture=()=>{
      const current=body.querySelector('#communityRolePanel');
      if(current)savedRolePanel=current;
    };
    capture();

    observer=new MutationObserver(()=>{
      const current=body.querySelector('#communityRolePanel');
      if(current){
        savedRolePanel=current;
      }else if(savedRolePanel&&body.isConnected){
        // Profile refreshes replace the whole body. Put the existing role panel
        // straight back in the same JavaScript turn so iOS never paints the
        // temporary gap that made the page jump/flicker in the screen recording.
        const about=body.querySelector('.profile-about');
        if(about)body.insertBefore(savedRolePanel,about);else body.appendChild(savedRolePanel);
      }
      syncVersion();
    });
    observer.observe(body,{childList:true});
    syncVersion();
  }

  function ready(){
    install();
    // v13 may still be finishing its first async role lookup when this loads.
    // These retries only attach the watcher; they do not redraw the profile.
    setTimeout(install,120);
    setTimeout(install,500);
    syncVersion();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
