/* FOH Toolkit 3.0 — core library workflow */
(function(){
  'use strict';
  const VERSION='Prototype 3.0.0';
  const OFFLINE_USER_KEY='fohOfflineUser';
  const STATE_PREFIX='fohScopedState:';
  const GUEST_KEY='fohOfficialLibrary:guest';
  const MODES=['all','favourites','recent','used','pinned'];
  let mode=localStorage.getItem('fohOfficialLibraryMode')||'all';
  let syncTimer=null;

  function parse(raw,fallback){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function user(){return parse(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function scopedRecord(){const u=user();return u?.id?parse(localStorage.getItem(`${STATE_PREFIX}${u.id}`),null):null;}
  function blankPrefs(){return {favourites:[],pinned:[],recent:[],usage:{}};}
  function prefs(){
    const u=user();
    if(u?.id){const r=scopedRecord();return Object.assign(blankPrefs(),r?.snapshot?.libraryPrefs||{});}
    return Object.assign(blankPrefs(),parse(localStorage.getItem(GUEST_KEY),{})||{});
  }
  function scheduleSync(){
    if(!navigator.onLine)return;
    clearTimeout(syncTimer);syncTimer=setTimeout(()=>document.getElementById('fohSyncNow')?.click(),700);
  }
  function savePrefs(next){
    const clean={favourites:[...new Set(next.favourites||[])],pinned:[...new Set(next.pinned||[])],recent:[...new Set(next.recent||[])].slice(0,30),usage:next.usage||{}};
    const u=user();
    if(u?.id){
      const key=`${STATE_PREFIX}${u.id}`;const r=parse(localStorage.getItem(key),null)||{snapshot:{}};r.snapshot=r.snapshot||{};r.snapshot.libraryPrefs=clean;r.dirty=true;r.updatedAt=new Date().toISOString();localStorage.setItem(key,JSON.stringify(r));scheduleSync();
    }else localStorage.setItem(GUEST_KEY,JSON.stringify(clean));
  }
  function toggleSet(field,id){const p=prefs();const s=new Set(p[field]||[]);s.has(id)?s.delete(id):s.add(id);p[field]=[...s];savePrefs(p);renderPresets();if(document.getElementById('presetDialog')?.open)decoratePresetDetail(id);}
  function recordUse(id){const p=prefs();p.usage[id]=(Number(p.usage[id])||0)+1;p.recent=[id,...(p.recent||[]).filter(x=>x!==id)].slice(0,30);savePrefs(p);}

  function auditOfficialPresets(){
    const seen=new Set();const issues=[];
    presets.forEach(p=>{
      if(!p?.id||seen.has(p.id))issues.push(`${p?.name||'Unnamed'}: duplicate/missing id`);seen.add(p?.id);
      if(!p?.name||!p?.category)issues.push(`${p?.id||'unknown'}: missing name/category`);
      if(p.hpf!=null&&(!Number.isFinite(Number(p.hpf))||p.hpf<20||p.hpf>2000))issues.push(`${p.id}: HPF out of range`);
      if(p.lpf!=null&&(!Number.isFinite(Number(p.lpf))||p.lpf<100||p.lpf>22000))issues.push(`${p.id}: LPF out of range`);
      if(p.hpf&&p.lpf&&p.hpf>=p.lpf)issues.push(`${p.id}: HPF >= LPF`);
      (p.eq||[]).forEach((b,i)=>{if(!Number.isFinite(Number(b.f))||b.f<20||b.f>20000||!Number.isFinite(Number(b.g))||Math.abs(b.g)>12||!Number.isFinite(Number(b.q))||b.q<0.1||b.q>20)issues.push(`${p.id}: EQ band ${i+1} invalid`);});
    });
    if(issues.length)console.warn('FOH Toolkit preset QA warnings',issues);
    else console.info(`FOH Toolkit preset QA passed: ${presets.length} official presets`);
    return issues;
  }

  function ensureQuickFilters(){
    const screen=document.getElementById('screen-presets');if(!screen||document.getElementById('officialQuickFilters'))return;
    const toolbar=screen.querySelector('.toolbar');if(!toolbar)return;
    const bar=document.createElement('div');bar.id='officialQuickFilters';bar.className='v3-filter-chips';
    bar.innerHTML=`<button data-library-mode="all">All</button><button data-library-mode="favourites">★ Favourites</button><button data-library-mode="recent">Recent</button><button data-library-mode="used">Most used</button><button data-library-mode="pinned">Pinned</button>`;
    toolbar.insertAdjacentElement('afterend',bar);
    bar.querySelectorAll('[data-library-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.libraryMode;localStorage.setItem('fohOfficialLibraryMode',mode);renderPresets();}));
  }

  function cardHtml(p,pf){
    const g=typeof groupForPreset==='function'?groupForPreset(p):{color:'#4bd4a0',soft:'rgba(75,212,160,.12)',name:p.category};
    const fav=pf.favourites.includes(p.id),pin=pf.pinned.includes(p.id),uses=Number(pf.usage[p.id])||0;
    return `<article class="preset-card grouped-card v3-official-card" data-preset="${esc(p.id)}" style="--group:${g.color};--group-soft:${g.soft}">
      <span class="verified">VERIFIED</span><div class="group-ribbon">${esc(g.name||p.category)}</div>
      <button type="button" class="v3-card-action favourite ${fav?'active':''}" data-official-fav="${esc(p.id)}" aria-label="Favourite ${esc(p.name)}">${fav?'★':'☆'}</button>
      <button type="button" class="v3-card-action pin ${pin?'active':''}" data-official-pin="${esc(p.id)}" aria-label="Pin ${esc(p.name)}">${pin?'●':'○'}</button>
      <div class="category-icon">${esc(p.icon||'P')}</div><h4>${esc(p.name)}</h4><p>${esc(p.style||p.category)}</p>${uses?`<small class="v3-use-count">Opened ${uses}×</small>`:''}
    </article>`;
  }

  function filteredPresets(){
    const q=(document.getElementById('presetSearch')?.value||'').trim().toLowerCase();const cat=document.getElementById('categoryFilter')?.value||'all';const pf=prefs();
    let list=presets.filter(p=>(cat==='all'||p.category===cat)&&(!q||`${p.name} ${p.category} ${p.style} ${p.description||''}`.toLowerCase().includes(q)));
    if(mode==='favourites')list=list.filter(p=>pf.favourites.includes(p.id));
    if(mode==='pinned')list=list.filter(p=>pf.pinned.includes(p.id));
    if(mode==='recent'){const rank=new Map((pf.recent||[]).map((id,i)=>[id,i]));list=list.filter(p=>rank.has(p.id)).sort((a,b)=>rank.get(a.id)-rank.get(b.id));}
    else if(mode==='used')list=list.filter(p=>(pf.usage[p.id]||0)>0).sort((a,b)=>(pf.usage[b.id]||0)-(pf.usage[a.id]||0));
    else if(mode==='all')list.sort((a,b)=>Number(pf.pinned.includes(b.id))-Number(pf.pinned.includes(a.id))||a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
    return {list,pf};
  }

  const baseRenderPresets=window.renderPresets||renderPresets;
  window.renderPresets=renderPresets=function(){
    ensureQuickFilters();const {list,pf}=filteredPresets();
    const count=document.getElementById('presetCount');if(count)count.textContent=`${list.length} preset${list.length===1?'':'s'}`;
    const grid=document.getElementById('presetGrid');if(!grid)return baseRenderPresets?.();
    grid.innerHTML=list.length?list.map(p=>cardHtml(p,pf)).join(''):'<div class="empty-state" style="grid-column:1/-1">No matching presets.</div>';
    grid.querySelectorAll('[data-preset]').forEach(c=>c.addEventListener('click',e=>{if(e.target.closest('.v3-card-action'))return;openPreset(c.dataset.preset);}));
    grid.querySelectorAll('[data-official-fav]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleSet('favourites',b.dataset.officialFav);}));
    grid.querySelectorAll('[data-official-pin]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleSet('pinned',b.dataset.officialPin);}));
    document.querySelectorAll('[data-library-mode]').forEach(b=>b.classList.toggle('active',b.dataset.libraryMode===mode));
  };

  function decoratePresetDetail(id){
    const p=presets.find(x=>x.id===id);const detail=document.getElementById('presetDetail');if(!p||!detail||detail.querySelector('.community-separate-note'))return;
    const pf=prefs();let box=detail.querySelector('#officialPresetV3Tools');
    if(!box){box=document.createElement('div');box.id='officialPresetV3Tools';box.className='v3-official-detail-tools';const helper=detail.querySelector('.helper');helper?.parentElement.insertBefore(box,helper);}
    box.innerHTML=`<div class="v3-detail-actions"><button class="secondary" id="officialFavouriteBtn">${pf.favourites.includes(id)?'★ Favourite':'☆ Favourite'}</button><button class="secondary" id="officialPinBtn">${pf.pinned.includes(id)?'● Pinned':'○ Pin preset'}</button></div><div class="v3-starting-point"><strong>STARTING POINT ONLY</strong><span>Set gain first, listen to the actual source and room, then adjust by ear. Do not copy EQ or dynamics blindly.</span></div>`;
    box.querySelector('#officialFavouriteBtn')?.addEventListener('click',()=>toggleSet('favourites',id));
    box.querySelector('#officialPinBtn')?.addEventListener('click',()=>toggleSet('pinned',id));
  }

  const baseOpenPreset=window.openPreset||openPreset;
  window.openPreset=openPreset=function(id){recordUse(id);const r=baseOpenPreset(id);requestAnimationFrame(()=>decoratePresetDetail(id));return r;};

  function statusText(){
    const raw=document.getElementById('fohSyncPill')?.textContent?.trim()||document.getElementById('fohAccountSyncStatus')?.textContent?.trim()||'';
    if(!navigator.onLine)return 'Offline · saved locally';
    if(/syncing/i.test(raw))return 'Syncing…';
    if(/error|failed/i.test(raw))return 'Sync issue';
    if(/offline|local/i.test(raw)&&!/synced/i.test(raw))return raw;
    return 'Synced';
  }
  function updateGlobalStatus(){const el=document.getElementById('v3GlobalSync');if(!el)return;const t=statusText();el.textContent=t;el.dataset.state=/offline/i.test(t)?'offline':/issue|error/i.test(t)?'error':/syncing/i.test(t)?'syncing':'synced';}
  function ensureGlobalStatus(){
    if(document.getElementById('v3GlobalSync'))return;
    const el=document.createElement('div');el.id='v3GlobalSync';el.className='v3-global-sync';document.body.appendChild(el);updateGlobalStatus();
    const source=document.getElementById('fohSyncPill')||document.getElementById('fohAccountSyncStatus');if(source)new MutationObserver(updateGlobalStatus).observe(source,{childList:true,subtree:true,characterData:true});
    window.addEventListener('online',updateGlobalStatus);window.addEventListener('offline',updateGlobalStatus);
  }

  function setVersion(){const v=document.getElementById('versionText');if(v)v.textContent=VERSION;const pv=document.querySelector('#fohProfileBody .profile-about .profile-stat-row strong');if(pv)pv.textContent=VERSION;}
  function ready(){if(!MODES.includes(mode))mode='all';auditOfficialPresets();ensureQuickFilters();ensureGlobalStatus();setVersion();renderPresets();document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>setTimeout(setVersion,60));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();
