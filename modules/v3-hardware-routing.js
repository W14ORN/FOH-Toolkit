/* FOH Toolkit 3.0 — desk-aware output source labels after 1:1 I/O patch */
(function(){
  'use strict';
  let activeId=null;
  const prior=window.openShow;
  if(typeof prior==='function')window.openShow=function(id){activeId=id;return prior(id);};
  function normal(k){return typeof normaliseConsoleKey==='function'?normaliseConsoleKey(k):k;}
  function plan(consoleKey){
    const k=normal(consoleKey);
    if(/^ah_sq/.test(k))return {prefix:'Mix',mains:['Main LR L','Main LR R']};
    if(['ah_avantis','ah_dlive','ah_qu'].includes(k))return {prefix:'Mix',mains:['Main L','Main R']};
    if(['behr_x32','behr_wing','midas_hd96'].includes(k))return {prefix:'Bus',mains:['Main L','Main R']};
    if(['yam_dm3','yam_dm3s','yam_dm','yam_clql'].includes(k))return {prefix:'Mix',mains:['Stereo L','Stereo R']};
    if(['yam_dm7','yam_dm7c'].includes(k))return {prefix:'Mix',mains:['Stereo A L','Stereo A R']};
    if(k==='yam_tf')return {prefix:'Aux',mains:['Stereo L','Stereo R']};
    if(k==='yam_rivage')return {prefix:'Mix',mains:['Stereo L','Stereo R']};
    if(k==='sc_si')return {prefix:'Mix',mains:['Main L','Main R']};
    if(k==='sc_vi')return {prefix:'Aux',mains:['Main L','Main R']};
    if(['digico_quantum','digico_sd','digico_s','avid_s6l','presonus_s3','ssl_live','roland_m5000'].includes(k))return {prefix:'Aux',mains:['Main L','Main R']};
    if(k==='tascam_sonicview')return {prefix:'Mix',mains:['Main L','Main R']};
    return {prefix:'Mix',mains:['Main L','Main R']};
  }
  document.addEventListener('click',e=>{
    if(e.target?.id!=='v3AutoPatch'||!activeId)return;
    setTimeout(()=>{
      const show=state.shows?.find(s=>s.id===activeId);if(!show||!Array.isArray(show.outputs)||!show.outputs.length)return;
      const p=plan(show.console),n=show.outputs.length;
      show.outputs.forEach((o,i)=>{const source=n>=2&&i===n-2?p.mains[0]:n>=2&&i===n-1?p.mains[1]:`${p.prefix} ${i+1}`;o.source=source;o.name=source;});
      if(typeof persist==='function')persist();
      setTimeout(()=>window.openShow(activeId),0);
    },15);
  });
})();
