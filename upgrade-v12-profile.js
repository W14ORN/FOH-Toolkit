/* FOH Toolkit Prototype 2.0.3 — My Profile */
(function(){
  'use strict';

  const OFFLINE_USER_KEY='fohOfflineUser';
  const STATE_PREFIX='fohScopedState:';

  function parseJson(raw,fallback=null){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function user(){return parseJson(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function scopedKey(uid){return `${STATE_PREFIX}${uid}`;}
  function record(){const u=user();return u?.id?parseJson(localStorage.getItem(scopedKey(u.id)),null):null;}
  function profile(){return record()?.snapshot?.profile||{};}
  function profileInitials(name,email){
    const source=(name||email||'FOH').trim();
    const bits=source.split(/\s+/).filter(Boolean);
    if(bits.length>1)return `${bits[0][0]||''}${bits[bits.length-1][0]||''}`.toUpperCase();
    return source.slice(0,2).toUpperCase();
  }
  function fmtTime(iso){
    if(!iso)return 'Not yet';
    try{return new Date(iso).toLocaleString();}catch(_e){return 'Not yet';}
  }
  function syncText(){
    return document.getElementById('fohAccountSyncStatus')?.textContent?.trim()||
      document.getElementById('fohSyncPill')?.textContent?.trim()||
      (navigator.onLine?'Saved locally':'Offline · saved');
  }
  function selectedDeskName(){
    try{return typeof getDeskProfile==='function'?getDeskProfile(state.console||localStorage.getItem('fohConsole')||'generic').name:'—';}
    catch(_e){return '—';}
  }

  function loadCss(){
    if(document.getElementById('fohProfileCss'))return;
    const l=document.createElement('link');
    l.id='fohProfileCss';l.rel='stylesheet';l.href='upgrade-v12.css';
    document.head.appendChild(l);
  }

  function ensureProfileScreen(){
    let screen=document.getElementById('screen-profile');
    if(screen)return screen;
    const main=document.getElementById('mainContent');if(!main)return null;
    screen=document.createElement('section');
    screen.className='screen';screen.dataset.screen='profile';screen.id='screen-profile';
    screen.innerHTML=`
      <div class="hero compact">
        <span class="eyebrow">ACCOUNT</span>
        <h2>My Profile</h2>
        <p>Keep your FOH Toolkit identity, preferred desk and account sync controls together.</p>
      </div>
      <div id="fohProfileBody"></div>`;
    main.appendChild(screen);
    return screen;
  }

  function ensureProfileNav(){
    const nav=document.querySelector('.bottom-nav');if(!nav)return null;
    let btn=nav.querySelector('[data-nav="profile"]');
    if(btn)return btn;
    btn=document.createElement('button');
    btn.dataset.nav='profile';
    btn.innerHTML='<span>●</span><small>Profile</small>';
    btn.addEventListener('click',()=>{
      if(typeof switchScreen==='function')switchScreen('profile');
      const kicker=document.getElementById('screenKicker');if(kicker)kicker.textContent='Account, sync and preferences';
      renderProfile();
    });
    nav.appendChild(btn);
    return btn;
  }

  function deskOptions(){
    const selected=state?.console||localStorage.getItem('fohConsole')||'generic';
    if(typeof consoleOptionsHTML==='function')return consoleOptionsHTML(selected);
    return `<option value="${esc(selected)}">${esc(selected)}</option>`;
  }

  function renderProfile(){
    const body=document.getElementById('fohProfileBody');if(!body)return;
    const u=user(),p=profile(),rec=record();
    if(!u){
      body.innerHTML='<div class="panel profile-card"><p class="helper no-top">Sign in to use My Profile.</p></div>';
      return;
    }
    const displayName=p.displayName||'';
    const company=p.company||'';
    const role=p.role||'FOH Engineer';
    const initials=profileInitials(displayName,u.email);
    const shows=Array.isArray(state?.shows)?state.shows.length:0;
    const status=syncText();
    const online=navigator.onLine?'Online':'Offline';

    body.innerHTML=`
      <div class="panel profile-identity-card">
        <div class="profile-avatar">${esc(initials)}</div>
        <div class="profile-identity-copy">
          <span class="eyebrow">SIGNED IN</span>
          <h3>${esc(displayName||u.email||'FOH Toolkit user')}</h3>
          <p>${esc(u.email||'')}</p>
        </div>
      </div>

      <div class="panel profile-card">
        <div class="section-mini-head"><div><span class="eyebrow">PROFILE</span><h3>Engineer details</h3></div></div>
        <div class="field"><label for="profileDisplayName">Name</label><input id="profileDisplayName" maxlength="60" value="${esc(displayName)}" placeholder="e.g. Will" /></div>
        <div class="field"><label for="profileCompany">Company / band / venue</label><input id="profileCompany" maxlength="80" value="${esc(company)}" placeholder="Optional" /></div>
        <div class="field"><label for="profileRole">Main role</label><select id="profileRole">
          ${['FOH Engineer','Monitor Engineer','Sound Engineer','System Tech','Musician / Engineer','Other'].map(x=>`<option ${x===role?'selected':''}>${esc(x)}</option>`).join('')}
        </select></div>
        <button class="primary full" id="saveProfileBtn" type="button">Save profile</button>
        <p class="helper">These details are saved with your FOH Toolkit account and follow you to other devices after sync.</p>
      </div>

      <div class="panel profile-card">
        <div class="section-mini-head"><div><span class="eyebrow">PREFERENCES</span><h3>Default desk</h3></div></div>
        <div class="field"><label for="profileDeskSelect">Console</label><select id="profileDeskSelect">${deskOptions()}</select></div>
        <p class="helper">Current: ${esc(selectedDeskName())}. Presets will use this saved desk automatically.</p>
      </div>

      <div class="panel profile-card">
        <div class="section-mini-head"><div><span class="eyebrow">CLOUD</span><h3>Account & sync</h3></div><span id="profileOnlineStatus" class="profile-online ${navigator.onLine?'online':'offline'}">${online}</span></div>
        <div class="profile-stat-row"><span>Email</span><strong>${esc(u.email||'—')}</strong></div>
        <div class="profile-stat-row"><span>Sync</span><strong id="profileSyncStatus">${esc(status)}</strong></div>
        <div class="profile-stat-row"><span>Last synced</span><strong id="profileLastSync">${esc(fmtTime(rec?.lastSyncedAt))}</strong></div>
        <div class="profile-stat-row"><span>Saved shows</span><strong>${shows}</strong></div>
        <div class="profile-actions"><button class="secondary" id="profileSyncNow" type="button">Sync now</button><button class="danger-button" id="profileSignOut" type="button">Sign out</button></div>
        <p class="helper">Your show data is saved on this device first. You can keep working offline after you have logged in once, then sync changes when internet returns.</p>
      </div>

      <div class="panel profile-card profile-about">
        <span class="eyebrow">FOH TOOLKIT</span>
        <div class="profile-stat-row"><span>Version</span><strong>Prototype 2.0.3</strong></div>
      </div>`;

    const desk=document.getElementById('profileDeskSelect');
    if(desk)desk.value=state?.console||localStorage.getItem('fohConsole')||'generic';
    bindProfileControls();
  }

  function updateLiveStatus(){
    if(!document.getElementById('screen-profile')?.classList.contains('active'))return;
    const rec=record();
    const online=document.getElementById('profileOnlineStatus');
    if(online){online.textContent=navigator.onLine?'Online':'Offline';online.className=`profile-online ${navigator.onLine?'online':'offline'}`;}
    const sync=document.getElementById('profileSyncStatus');if(sync)sync.textContent=syncText();
    const last=document.getElementById('profileLastSync');if(last)last.textContent=fmtTime(rec?.lastSyncedAt);
  }

  function saveProfile(){
    const u=user();if(!u?.id)return;
    const rec=record()||{snapshot:{},dirty:false,updatedAt:null,lastSyncedAt:null};
    rec.snapshot=rec.snapshot||{};
    rec.snapshot.profile={
      displayName:(document.getElementById('profileDisplayName')?.value||'').trim(),
      company:(document.getElementById('profileCompany')?.value||'').trim(),
      role:document.getElementById('profileRole')?.value||'FOH Engineer'
    };
    rec.dirty=true;rec.updatedAt=new Date().toISOString();
    localStorage.setItem(scopedKey(u.id),JSON.stringify(rec));
    if(typeof toast==='function')toast(navigator.onLine?'Profile saved · syncing':'Profile saved offline');
    renderProfile();
    if(navigator.onLine)setTimeout(()=>document.getElementById('fohSyncNow')?.click(),60);
  }

  function changeDesk(value){
    const global=document.getElementById('consoleSelect');
    if(global){global.value=value;global.dispatchEvent(new Event('change',{bubbles:true}));}
    else{
      state.console=value;localStorage.setItem('fohConsole',value);sessionStorage.setItem('fohSessionConsole',value);
      if(typeof persist==='function')persist();
    }
    if(typeof toast==='function')toast(`Default desk: ${typeof getDeskProfile==='function'?getDeskProfile(value).name:value}`);
    renderProfile();
  }

  function bindProfileControls(){
    document.getElementById('saveProfileBtn')?.addEventListener('click',saveProfile);
    document.getElementById('profileDeskSelect')?.addEventListener('change',e=>changeDesk(e.target.value));
    document.getElementById('profileSyncNow')?.addEventListener('click',()=>{
      const btn=document.getElementById('fohSyncNow');
      if(btn)btn.click();else if(typeof toast==='function')toast(navigator.onLine?'Sync is reconnecting…':'Offline · changes saved');
      setTimeout(updateLiveStatus,650);
    });
    document.getElementById('profileSignOut')?.addEventListener('click',()=>{
      if(!confirm('Sign out of FOH Toolkit on this device?'))return;
      document.getElementById('fohSignOut')?.click();
    });
  }

  function preserveProfileAcrossPersist(){
    if(typeof persist!=='function'||persist._fohProfileWrapped)return;
    const previous=persist;
    const wrapped=function(){
      const u=user();
      const before=u?.id?profile():null;
      const result=previous.apply(this,arguments);
      if(u?.id&&before&&Object.keys(before).length){
        const rec=record();
        if(rec){rec.snapshot=rec.snapshot||{};rec.snapshot.profile=before;localStorage.setItem(scopedKey(u.id),JSON.stringify(rec));}
      }
      return result;
    };
    wrapped._fohProfileWrapped=true;
    persist=wrapped;
  }

  function ready(){
    loadCss();ensureProfileScreen();ensureProfileNav();preserveProfileAcrossPersist();
    const version=document.getElementById('versionText');if(version)version.textContent='Prototype 2.0.3';
    window.addEventListener('online',()=>setTimeout(updateLiveStatus,100));
    window.addEventListener('offline',updateLiveStatus);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateLiveStatus();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
