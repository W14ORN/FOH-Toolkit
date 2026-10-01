/* FOH Toolkit 3.0 — keep show hardware compatible when desk changes */
(function(){
  'use strict';
  let activeId=null;
  const prior=window.openShow;
  if(typeof prior==='function')window.openShow=function(id){activeId=id;return prior(id);};
  document.addEventListener('change',e=>{
    if(e.target?.id!=='showConsoleSelect'||!activeId)return;
    setTimeout(()=>{
      const show=state.shows?.find(s=>s.id===activeId),select=document.getElementById('v3HardwareSelect');
      if(!show||!select)return;
      const allowed=[...select.options].map(o=>o.value);
      if(show.stageboxProfile&&!allowed.includes(show.stageboxProfile)){
        show.stageboxProfile='manual';
        if(typeof persist==='function')persist();
        if(typeof toast==='function')toast('I/O hardware reset to Manual for the new desk');
        setTimeout(()=>window.openShow(activeId),0);
      }
    },40);
  });
})();
