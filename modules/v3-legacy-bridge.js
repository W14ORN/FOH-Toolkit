/* Keep validated legacy/native exporters attached to the new v3 show workspace. */
(function(){
  'use strict';
  const legacyOpenShow=window.openShow;
  if(typeof legacyOpenShow!=='function')return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    const modernOpenShow=window.openShow;
    if(typeof modernOpenShow==='function'&&modernOpenShow!==legacyOpenShow){
      clearInterval(timer);
      window.openShow=function(id){
        // The legacy wrapper sets exporter-specific active-show state (for example
        // the validated SQ native beta). The modern renderer immediately replaces
        // the old show body, so the user only sees the v3 workspace.
        try{legacyOpenShow(id);}catch(err){console.warn('Legacy show bridge',err);}
        return modernOpenShow(id);
      };
    }else if(tries>100){
      clearInterval(timer);
      console.warn('FOH Toolkit: modern show renderer did not become available for legacy exporter bridge.');
    }
  },20);
})();