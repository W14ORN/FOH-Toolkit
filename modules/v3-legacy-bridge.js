/* Keep validated legacy/native exporters attached to the new v3 show workspace. */
(function(){
  'use strict';
  const legacyOpenShow=window.openShow;
  setTimeout(()=>{
    const modernOpenShow=window.openShow;
    if(typeof legacyOpenShow!=='function'||typeof modernOpenShow!=='function'||legacyOpenShow===modernOpenShow)return;
    window.openShow=function(id){
      // The legacy wrapper sets exporter-specific active-show state (for example
      // the validated SQ native beta). The modern renderer immediately replaces
      // the old show body, so the user only sees the v3 workspace.
      try{legacyOpenShow(id);}catch(err){console.warn('Legacy show bridge',err);}
      return modernOpenShow(id);
    };
  },0);
})();
