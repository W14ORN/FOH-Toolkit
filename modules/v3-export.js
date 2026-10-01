/* FOH Toolkit 3.0 — complete show export */
(function(){
  'use strict';
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function safe(s){return String(s||'show').replace(/[^a-z0-9-_]+/gi,'_').replace(/^_+|_+$/g,'')||'show';}
  function presetPayload(ch,consoleKey){
    const p=presets.find(x=>x.id===ch.presetId);if(!p)return ch.embeddedPreset?clone(ch.embeddedPreset):null;
    return {id:p.id,name:p.name,category:p.category,style:p.style,universal:{hpf:p.hpf,lpf:p.lpf,eq:p.eq,gate:p.gate,comp:p.comp},translated:typeof translatePreset==='function'?translatePreset(p,consoleKey):null};
  }
  window.exportShowPackage=exportShowPackage=function(show){
    const payload={
      format:'FOH-Toolkit-Show',version:'3.0',schema:3,exportedAt:new Date().toISOString(),
      show:{
        id:show.id,name:show.name,console:show.console,consoleName:typeof getDeskProfile==='function'?getDeskProfile(show.console).name:show.console,stageboxProfile:show.stageboxProfile||'manual',notes:show.notes||'',
        io:clone(show.io||{}),outputs:clone(show.outputs||[]),softKeys:clone(show.softKeys||[]),dcas:clone(show.dcas||[]),muteGroups:clone(show.muteGroups||[]),
        channels:(show.channels||[]).map((ch,i)=>({number:i+1,id:ch.id,name:ch.name,custom:!!ch.custom,source:clone(show.io?.[ch.id]||{}),preset:presetPayload(ch,show.console)}))
      }
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${safe(show.name)}.fohshow.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);if(typeof toast==='function')toast('Complete FOH Toolkit show package exported');
  };
})();
