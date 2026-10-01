/* FOH Toolkit 3.0 — rebuild official category list after specialist presets load */
(function(){
  'use strict';
  const select=document.getElementById('categoryFilter');if(!select||typeof presets==='undefined')return;
  const selected=select.value||'all';const cats=[...new Set(presets.map(p=>p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  select.innerHTML='<option value="all">All channels</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  select.value=[...select.options].some(o=>o.value===selected)?selected:'all';
})();
