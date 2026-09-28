chooseShowForPreset = function(p){
  ensureShowDefaults();
  if(!state.shows.length){
    const name=prompt('Name your first show','My Band'); if(!name)return;
    state.shows.push({id:crypto.randomUUID(),name:name.trim(),console:state.console||'generic',channels:[],io:{},outputs:[],softKeys:[]});
  }
  const choices=state.shows.map((s,i)=>`${i+1}. ${s.name} — ${getDeskProfile(s.console).name}`).join('\n');
  const result=prompt(`Add ${p.name} to which show?\n\n${choices}`,'1'); const idx=Number(result)-1; if(!state.shows[idx])return;
  const s=state.shows[idx]; const ch={id:crypto.randomUUID(),presetId:p.id,name:p.name}; s.channels.push(ch);
  s.io[ch.id]=s.io[ch.id]||{source:'',channel:`CH ${s.channels.length}`};
  persist();renderShows();toast(`Added to ${s.name} · ${getDeskProfile(s.console).family}`); $('#presetDialog').close();
};

bindShows = function(){
  $('#newShowBtn').addEventListener('click',()=>{
    const name=prompt('Show name','New Show');if(!name?.trim())return;
    state.shows.push({id:crypto.randomUUID(),name:name.trim(),console:state.console||'generic',channels:[],io:{},outputs:[],softKeys:[]});persist();renderShows();openShow(state.shows.at(-1).id);
  });
};

renderShows = function(){
  ensureShowDefaults();
  const el=$('#showsList'); if(!state.shows.length){el.className='list-stack empty-state';el.innerHTML='No shows yet. Create one, select its desk, then add presets from the library.';return;} el.className='list-stack';
  el.innerHTML=state.shows.map(s=>`<button class="list-item show-list-item" style="text-align:left;color:inherit" data-show="${s.id}"><div class="freq-chip">${s.channels.length} CH</div><div class="grow"><h4>${esc(s.name)}</h4><p>${esc(getDeskProfile(s.console).name)} · ${s.channels.length?s.channels.slice(0,3).map(c=>esc(c.name)).join(' · '):'Empty show'}</p></div><span>›</span></button>`).join('');
  $$('[data-show]').forEach(b=>b.addEventListener('click',()=>openShow(b.dataset.show)));
};

function channelCardHTML(s,c,i){
  const p=presets.find(x=>x.id===c.presetId); if(!p)return '';
  const g=groupForPreset(p); const io=s.io[c.id]||{};
  return `<article class="show-channel-card" data-channel-card="${c.id}" style="--group:${g.color};--group-soft:${g.soft}">
    <div class="channel-card-top"><div><span class="channel-number">CH ${i+1}</span><span class="group-pill">${esc(g.name)}</span></div><button class="mini-btn" data-remove-channel="${c.id}">Remove</button></div>
    <h3>${esc(c.name)}</h3><p class="channel-desk-line">${esc(getDeskProfile(s.console).name)} · ${esc(io.source||'Input source not assigned')}</p>
    ${translatedSettingsHTML(p,s.console,true)}
  </article>`;
}

function showChannelsPane(s){
  return `<div class="show-pane active" data-show-pane="channels">
    ${s.channels.length?`<div class="channel-swipe-help">Swipe left/right through channels</div><div class="show-channel-swiper" id="showChannelSwiper">${s.channels.map((c,i)=>channelCardHTML(s,c,i)).join('')}</div><div class="show-channel-nav"><button class="secondary" id="prevChannelBtn">‹ Previous</button><span id="channelPosition">1 / ${s.channels.length}</span><button class="secondary" id="nextChannelBtn">Next ›</button></div>`:'<div class="empty-state">No channels yet. Add presets from the Presets tab.</div>'}
  </div>`;
}

function showConsolePane(s){
  const d=getDeskProfile(s.console);
  return `<div class="show-pane" data-show-pane="console">
    <div class="panel show-config-panel"><div class="section-mini-head"><div><span class="eyebrow">INPUT PATCH</span><h3>Channel I/O</h3></div><span class="count-pill">${s.channels.length} inputs</span></div>
      ${s.channels.length?s.channels.map((c,i)=>{const io=s.io[c.id]||{};return `<div class="io-row"><div class="io-ch">${i+1}</div><div class="io-name">${esc(c.name)}</div><input data-io-source="${c.id}" value="${esc(io.source||'')}" placeholder="Socket / source e.g. SLink 1"/><input data-io-channel="${c.id}" value="${esc(io.channel||`CH ${i+1}`)}" placeholder="Console channel"/></div>`}).join(''):'<div class="empty-state">Add channels before patching inputs.</div>'}
    </div>
    <div class="panel show-config-panel"><div class="section-mini-head"><div><span class="eyebrow">OUTPUT PATCH</span><h3>Outputs</h3></div><button class="text-button" id="addOutputBtn">＋ Add</button></div><div id="outputRows">${(s.outputs||[]).map((o,i)=>`<div class="output-row"><input data-output-name="${i}" value="${esc(o.name||'')}" placeholder="e.g. Main L / IEM 1"/><input data-output-dest="${i}" value="${esc(o.dest||'')}" placeholder="Socket / destination"/><button class="mini-btn" data-remove-output="${i}">×</button></div>`).join('')||'<div class="empty-state compact-empty">No outputs programmed yet.</div>'}</div></div>
    <div class="panel show-config-panel"><div class="section-mini-head"><div><span class="eyebrow">${esc((d.keyTerm||'Assignable key').toUpperCase())}</span><h3>Assignable controls</h3></div><button class="text-button" id="addSoftKeyBtn">＋ Add</button></div><p class="helper no-top">Use the exact hardware key/macro label you want. Desk-specific validation will be added with each native exporter.</p><div id="softKeyRows">${(s.softKeys||[]).map((k,i)=>`<div class="softkey-row"><input data-softkey-key="${i}" value="${esc(k.key||'')}" placeholder="${esc(d.keyTerm||'Key')} e.g. 1"/><input data-softkey-action="${i}" value="${esc(k.action||'')}" placeholder="Function e.g. Mute Group 1"/><input data-softkey-target="${i}" value="${esc(k.target||'')}" placeholder="Target / notes"/><button class="mini-btn" data-remove-softkey="${i}">×</button></div>`).join('')||'<div class="empty-state compact-empty">No assignable controls programmed yet.</div>'}</div></div>
    <div class="panel export-panel"><span class="eyebrow">EXPORT</span><h3>FOH Toolkit show package</h3><p>Exports your show, translated settings, I/O and assignable-control plan as a portable FOH Toolkit file. Native console files will be enabled desk-by-desk only after their formats are validated.</p><button class="primary full" id="exportShowBtn">Export show package</button></div>
  </div>`;
}

openShow = function(id){
  ensureShowDefaults();
  const s=state.shows.find(x=>x.id===id);if(!s)return;
  let currentIndex=0;
  const render=()=>{
    s.console=normaliseConsoleKey(s.console);
    const d=getDeskProfile(s.console);
    $('#showDetail').innerHTML=`
      <div class="detail-head"><span class="eyebrow">MY SHOW</span><h2>${esc(s.name)}</h2><p>${s.channels.length} channel${s.channels.length===1?'':'s'} · translated for ${esc(d.name)}</p></div>
      <div class="show-desk-select"><label>SHOW DESK</label><select id="showConsoleSelect">${consoleOptionsHTML(s.console)}</select></div>
      <div class="segment show-segment"><button class="active" data-show-tab="channels">Channels</button><button data-show-tab="console">I/O &amp; Keys</button></div>
      ${showChannelsPane(s)}${showConsolePane(s)}
      <div class="button-row"><button class="secondary" id="renameShow">Rename</button><button class="danger-button" id="deleteShow">Delete show</button></div>`;

    $('#showConsoleSelect').addEventListener('change',e=>{s.console=normaliseConsoleKey(e.target.value);persist();renderShows();render();toast(`Show translated for ${getDeskProfile(s.console).name}`);});
    $$('[data-show-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-show-tab]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-show-pane]').forEach(p=>p.classList.toggle('active',p.dataset.showPane===b.dataset.showTab));}));
    $$('[data-remove-channel]').forEach(b=>b.addEventListener('click',()=>{delete s.io[b.dataset.removeChannel];s.channels=s.channels.filter(c=>c.id!==b.dataset.removeChannel);persist();renderShows();render();}));
    $('#renameShow').addEventListener('click',()=>{const n=prompt('Show name',s.name);if(n?.trim()){s.name=n.trim();persist();renderShows();render();}});
    $('#deleteShow').addEventListener('click',()=>{if(confirm(`Delete ${s.name}?`)){state.shows=state.shows.filter(x=>x.id!==s.id);persist();renderShows();$('#showDialog').close();}});

    $$('[data-io-source]').forEach(i=>i.addEventListener('change',()=>{s.io[i.dataset.ioSource]=s.io[i.dataset.ioSource]||{};s.io[i.dataset.ioSource].source=i.value.trim();persist();}));
    $$('[data-io-channel]').forEach(i=>i.addEventListener('change',()=>{s.io[i.dataset.ioChannel]=s.io[i.dataset.ioChannel]||{};s.io[i.dataset.ioChannel].channel=i.value.trim();persist();}));
    $$('[data-output-name]').forEach(i=>i.addEventListener('change',()=>{s.outputs[Number(i.dataset.outputName)].name=i.value.trim();persist();}));
    $$('[data-output-dest]').forEach(i=>i.addEventListener('change',()=>{s.outputs[Number(i.dataset.outputDest)].dest=i.value.trim();persist();}));
    $$('[data-remove-output]').forEach(b=>b.addEventListener('click',()=>{s.outputs.splice(Number(b.dataset.removeOutput),1);persist();render();activateShowTab('console');}));
    $('#addOutputBtn')?.addEventListener('click',()=>{s.outputs.push({name:'',dest:''});persist();render();activateShowTab('console');});
    $$('[data-softkey-key]').forEach(i=>i.addEventListener('change',()=>{s.softKeys[Number(i.dataset.softkeyKey)].key=i.value.trim();persist();}));
    $$('[data-softkey-action]').forEach(i=>i.addEventListener('change',()=>{s.softKeys[Number(i.dataset.softkeyAction)].action=i.value.trim();persist();}));
    $$('[data-softkey-target]').forEach(i=>i.addEventListener('change',()=>{s.softKeys[Number(i.dataset.softkeyTarget)].target=i.value.trim();persist();}));
    $$('[data-remove-softkey]').forEach(b=>b.addEventListener('click',()=>{s.softKeys.splice(Number(b.dataset.removeSoftkey),1);persist();render();activateShowTab('console');}));
    $('#addSoftKeyBtn')?.addEventListener('click',()=>{s.softKeys.push({key:'',action:'',target:''});persist();render();activateShowTab('console');});
    $('#exportShowBtn')?.addEventListener('click',()=>exportShowPackage(s));

    const swiper=$('#showChannelSwiper');
    const updatePos=()=>{if(!swiper||!s.channels.length)return; const w=swiper.clientWidth||1; currentIndex=Math.max(0,Math.min(s.channels.length-1,Math.round(swiper.scrollLeft/w))); $('#channelPosition').textContent=`${currentIndex+1} / ${s.channels.length}`;};
    swiper?.addEventListener('scroll',()=>{clearTimeout(swiper._t);swiper._t=setTimeout(updatePos,80)});
    $('#prevChannelBtn')?.addEventListener('click',()=>{currentIndex=Math.max(0,currentIndex-1);swiper.scrollTo({left:currentIndex*swiper.clientWidth,behavior:'smooth'});setTimeout(updatePos,250);});
    $('#nextChannelBtn')?.addEventListener('click',()=>{currentIndex=Math.min(s.channels.length-1,currentIndex+1);swiper.scrollTo({left:currentIndex*swiper.clientWidth,behavior:'smooth'});setTimeout(updatePos,250);});
  };
  const activateShowTab=tab=>{const b=$(`[data-show-tab="${tab}"]`); if(b)b.click();};
  render(); $('#showDialog').showModal();
};

function exportShowPackage(s){
  const payload={
    format:'FOH-Toolkit-Show',version:'1.1',exportedAt:new Date().toISOString(),show:{id:s.id,name:s.name,console:s.console,consoleName:getDeskProfile(s.console).name,io:s.io,outputs:s.outputs,softKeys:s.softKeys,channels:s.channels.map((c,i)=>{const p=presets.find(x=>x.id===c.presetId);return {number:i+1,id:c.id,name:c.name,source:s.io[c.id]||{},group:p?groupForPreset(p).name:'Other',preset:p?{id:p.id,universal:{hpf:p.hpf,lpf:p.lpf,eq:p.eq,gate:p.gate,comp:p.comp},translated:translatePreset(p,s.console)}:null};})}
  };
  const safe=(s.name||'show').replace(/[^a-z0-9-_]+/gi,'_').replace(/^_+|_+$/g,'')||'show';
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${safe}.fohshow.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('FOH Toolkit show package exported');
}

document.addEventListener('DOMContentLoaded',()=>{
  ensureShowDefaults();
  $('#versionText').textContent='Prototype 1.1.0';
  renderPresets();renderShows();
});
