/* FOH Toolkit Prototype 2.1 — profile stability */
(function(){
  'use strict';

  let observer=null;
  let savedRolePanel=null;
  let desiredScrollY=window.scrollY||0;
  let ignoreScrollUntil=0;
  const draftFields=new Map();
  let focusedField=null;

  function profileActive(){
    return document.getElementById('screen-profile')?.classList.contains('active');
  }

  function syncVersion(){
    const globalVersion=document.getElementById('versionText');
    if(globalVersion)globalVersion.textContent='Prototype 2.1.0';
    const profileVersion=document.querySelector('#fohProfileBody .profile-about .profile-stat-row strong');
    if(profileVersion)profileVersion.textContent='Prototype 2.1.0';
  }

  function rememberDraft(target){
    if(!target?.id||!['profileDisplayName','profileCompany','profileRole','profileDeskSelect','communityAdminEmail'].includes(target.id))return;
    draftFields.set(target.id,target.value);
  }

  function restoreDrafts(){
    draftFields.forEach((value,id)=>{
      const el=document.getElementById(id);
      if(el&&el.value!==value)el.value=value;
    });
    if(!focusedField)return;
    const el=document.getElementById(focusedField.id);
    if(!el)return;
    try{
      el.focus({preventScroll:true});
      if(typeof el.setSelectionRange==='function'&&focusedField.start!=null){
        el.setSelectionRange(focusedField.start,focusedField.end??focusedField.start);
      }
    }catch(_e){}
  }

  function restoreScroll(y){
    if(!profileActive())return;
    ignoreScrollUntil=performance.now()+120;
    window.scrollTo({top:y,left:0,behavior:'auto'});
    requestAnimationFrame(()=>{
      ignoreScrollUntil=performance.now()+80;
      window.scrollTo({top:y,left:0,behavior:'auto'});
    });
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
      const keepY=desiredScrollY;
      const current=body.querySelector('#communityRolePanel');
      if(current){
        savedRolePanel=current;
      }else if(savedRolePanel&&body.isConnected){
        const about=body.querySelector('.profile-about');
        if(about)body.insertBefore(savedRolePanel,about);else body.appendChild(savedRolePanel);
      }
      restoreDrafts();
      syncVersion();
      restoreScroll(keepY);
    });
    observer.observe(body,{childList:true});
    syncVersion();
  }

  function loadV15(){
    if(document.querySelector('script[data-foh-v15]'))return;
    const s=document.createElement('script');
    s.src='upgrade-v15-library-community.js';
    s.dataset.fohV15='1';
    document.head.appendChild(s);
  }

  function ready(){
    document.addEventListener('input',e=>{if(profileActive())rememberDraft(e.target);},true);
    document.addEventListener('change',e=>{if(profileActive())rememberDraft(e.target);},true);
    document.addEventListener('focusin',e=>{
      if(!profileActive()||!e.target?.id)return;
      rememberDraft(e.target);
      focusedField={id:e.target.id,start:e.target.selectionStart,end:e.target.selectionEnd};
    },true);
    document.addEventListener('focusout',e=>{
      if(focusedField?.id===e.target?.id)focusedField=null;
    },true);
    window.addEventListener('scroll',()=>{
      if(!profileActive()||performance.now()<ignoreScrollUntil)return;
      desiredScrollY=window.scrollY||0;
    },{passive:true});
    document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>{desiredScrollY=0;});

    install();
    setTimeout(install,120);
    setTimeout(install,500);
    syncVersion();
    loadV15();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
