/* FOH Toolkit 3.0 — preserve v3 account-scoped state through legacy persist hook */
(function(){
  'use strict';
  const OFFLINE_USER_KEY='fohOfflineUser',STATE_PREFIX='fohScopedState:';
  function parse(raw,f){try{return JSON.parse(raw);}catch(_e){return f;}}
  function user(){return parse(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function key(uid){return `${STATE_PREFIX}${uid}`;}
  function install(){
    if(typeof persist!=='function'||persist._fohV3StateWrapped)return;
    const previous=persist;
    const wrapped=function(){
      const u=user(),before=u?.id?parse(localStorage.getItem(key(u.id)),null)?.snapshot||null:null;
      const keep=before?{libraryPrefs:before.libraryPrefs}:null;
      const result=previous.apply(this,arguments);
      if(u?.id&&keep?.libraryPrefs){
        const rec=parse(localStorage.getItem(key(u.id)),null);
        if(rec){rec.snapshot=rec.snapshot||{};rec.snapshot.libraryPrefs=keep.libraryPrefs;localStorage.setItem(key(u.id),JSON.stringify(rec));}
      }
      return result;
    };
    wrapped._fohV3StateWrapped=true;
    persist=wrapped;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
})();
