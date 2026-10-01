/* FOH Toolkit 3.1.3 — release polish: stable version display + login form cleanup */
(function(){
  'use strict';

  const VERSION='Prototype 3.1.3';
  window.FOH_VERSION=VERSION;

  function applyVersion(){
    const top=document.getElementById('versionText');
    if(top&&top.textContent!==VERSION)top.textContent=VERSION;

    document.querySelectorAll('#fohProfileBody .profile-about .profile-stat-row').forEach(row=>{
      const label=row.querySelector('span')?.textContent?.trim().toLowerCase();
      const value=row.querySelector('strong');
      if(label==='version'&&value&&value.textContent!==VERSION)value.textContent=VERSION;
    });

    document.documentElement.dataset.fohVersion='3.1.3';
  }

  function isLoginMode(){
    const login=document.querySelector('[data-auth-mode="login"]');
    const signup=document.querySelector('[data-auth-mode="signup"]');
    if(login?.classList.contains('active'))return true;
    if(signup?.classList.contains('active'))return false;
    return true;
  }

  function applyAuthMode(){
    const field=document.getElementById('fohConfirmField');
    const confirm=document.getElementById('fohAuthConfirm');
    const password=document.getElementById('fohAuthPassword');
    if(!field&&!confirm)return;

    const login=isLoginMode();
    if(field){
      field.hidden=login;
      field.style.display=login?'none':'';
      field.setAttribute('aria-hidden',login?'true':'false');
    }
    if(confirm){
      confirm.required=!login;
      confirm.disabled=login;
      if(login)confirm.value='';
    }
    if(password)password.autocomplete=login?'current-password':'new-password';
  }

  function settle(){
    applyVersion();
    applyAuthMode();
  }

  function install(){
    settle();

    document.addEventListener('click',e=>{
      if(e.target.closest('[data-auth-mode]')){
        queueMicrotask(applyAuthMode);
        setTimeout(applyAuthMode,0);
      }
      if(e.target.closest('[data-nav="profile"]')){
        setTimeout(applyVersion,0);
        setTimeout(applyVersion,90);
        setTimeout(applyVersion,250);
      }
    });

    document.getElementById('fohAuthForm')?.addEventListener('submit',()=>{
      // Login never needs a confirmation password. Keep confirmation scoped to account creation only.
      applyAuthMode();
    },true);

    const observer=new MutationObserver(()=>{
      settle();
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});

    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(settle,20);});
    window.addEventListener('pageshow',()=>setTimeout(settle,20));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
