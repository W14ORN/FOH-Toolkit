/* FOH Toolkit Prototype 1.8.0 — required account + offline/cloud sync */
(function(){
  'use strict';

  const SUPABASE_URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const SUPABASE_KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const SUPABASE_LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  const PROJECT_REF='emwyytgxyrxhyoxwjamu';
  const OFFLINE_USER_KEY='fohOfflineUser';
  const LEGACY_MIGRATED_KEY='fohLegacyMigrated';
  const STATE_PREFIX='fohScopedState:';
  const SYNC_DEBOUNCE=1400;

  let sb=null;
  let currentUser=null;
  let syncing=false;
  let syncTimer=null;
  let applyingRemote=false;
  let basePersist=null;
  let authMode='login';

  function nowIso(){return new Date().toISOString();}
  function scopedKey(uid){return `${STATE_PREFIX}${uid}`;}
  function parseJson(raw,fallback=null){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function cachedUser(){return parseJson(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function saveCachedUser(user){localStorage.setItem(OFFLINE_USER_KEY,JSON.stringify({id:user.id,email:user.email||''}));}

  function loadCss(){
    if(document.getElementById('fohAuthCss'))return;
    const l=document.createElement('link');
    l.id='fohAuthCss';l.rel='stylesheet';l.href='upgrade-v11.css';
    document.head.appendChild(l);
  }

  function ensureGate(){
    let gate=document.getElementById('fohAuthGate');
    if(gate)return gate;
    gate=document.createElement('div');
    gate.id='fohAuthGate';
    gate.className='foh-auth-gate';
    gate.innerHTML=`
      <div class="foh-auth-card">
        <div class="foh-auth-brand">
          <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
          <div><h1>FOH Toolkit</h1><p>Your shows, settings and desk setup — saved to your account.</p></div>
        </div>
        <div class="foh-auth-tabs" id="fohAuthTabs">
          <button type="button" data-auth-mode="login" class="active">Log in</button>
          <button type="button" data-auth-mode="signup">Create account</button>
        </div>
        <form class="foh-auth-form" id="fohAuthForm">
          <div class="field"><label for="fohAuthEmail">Email</label><input id="fohAuthEmail" type="email" autocomplete="email" required /></div>
          <div class="field"><label for="fohAuthPassword">Password</label><input id="fohAuthPassword" type="password" autocomplete="current-password" minlength="8" required /></div>
          <div class="field" id="fohConfirmField" hidden><label for="fohAuthConfirm">Confirm password</label><input id="fohAuthConfirm" type="password" autocomplete="new-password" minlength="8" /></div>
          <button class="primary full" id="fohAuthSubmit" type="submit">Log in</button>
          <div class="foh-auth-message" id="fohAuthMessage" aria-live="polite"></div>
        </form>
        <div class="foh-auth-loading" id="fohAuthLoading" hidden><span class="foh-auth-spinner"></span><span>Connecting securely…</span></div>
        <p class="foh-auth-foot" id="fohAuthFoot">Your first login needs internet. After that, FOH Toolkit can keep working offline on this device and sync again when you reconnect.</p>
      </div>`;
    document.body.appendChild(gate);

    gate.querySelectorAll('[data-auth-mode]').forEach(btn=>btn.addEventListener('click',()=>setAuthMode(btn.dataset.authMode)));
    gate.querySelector('#fohAuthForm').addEventListener('submit',submitAuth);
    return gate;
  }

  function setAuthMode(mode){
    authMode=mode==='signup'?'signup':'login';
    document.querySelectorAll('[data-auth-mode]').forEach(b=>b.classList.toggle('active',b.dataset.authMode===authMode));
    const confirm=document.getElementById('fohConfirmField');
    const pass=document.getElementById('fohAuthPassword');
    const conf=document.getElementById('fohAuthConfirm');
    if(confirm)confirm.hidden=authMode!=='signup';
    if(pass)pass.autocomplete=authMode==='signup'?'new-password':'current-password';
    if(conf)conf.required=authMode==='signup';
    const submit=document.getElementById('fohAuthSubmit');
    if(submit)submit.textContent=authMode==='signup'?'Create account':'Log in';
    setAuthMessage('');
  }

  function setAuthMessage(message,type=''){
    const el=document.getElementById('fohAuthMessage');if(!el)return;
    el.textContent=message||'';el.className=`foh-auth-message${type?` ${type}`:''}`;
  }
  function setAuthBusy(busy){
    const submit=document.getElementById('fohAuthSubmit');if(submit)submit.disabled=busy;
    const loading=document.getElementById('fohAuthLoading');if(loading)loading.hidden=!busy;
  }
  function showGate(mode='login',message=''){
    ensureGate().hidden=false;setAuthMode(mode);if(message)setAuthMessage(message);
  }
  function hideGate(){const g=document.getElementById('fohAuthGate');if(g)g.hidden=true;}

  async function loadSupabase(){
    if(window.supabase?.createClient)return window.supabase;
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-foh-supabase]');
      if(existing){
        existing.addEventListener('load',()=>resolve(window.supabase),{once:true});
        existing.addEventListener('error',()=>reject(new Error('Supabase library failed to load')),{once:true});
        return;
      }
      const s=document.createElement('script');
      s.src=SUPABASE_LIB;s.async=true;s.dataset.fohSupabase='1';
      s.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Supabase unavailable'));
      s.onerror=()=>reject(new Error('Supabase library failed to load'));
      document.head.appendChild(s);
    });
  }

  function snapshotApp(){
    return {
      schema:1,
      shows:Array.isArray(state?.shows)?state.shows:[],
      submissions:Array.isArray(state?.submissions)?state.submissions:[],
      console:state?.console||localStorage.getItem('fohConsole')||'generic',
      rtaDisplaySpeed:localStorage.getItem('fohRtaDisplaySpeed')||'7',
      rtaSmoothing:localStorage.getItem('fohRtaSmoothing')||document.getElementById('smoothingSelect')?.value||'0.68',
      lastShowId:localStorage.getItem('fohLastShowId')||null
    };
  }

  function meaningfulLegacy(){
    const snap=snapshotApp();
    return snap.shows.length>0||snap.submissions.length>0||snap.console!=='generic'||localStorage.getItem('fohRtaDisplaySpeed')!==null;
  }

  function readLocal(uid){return parseJson(localStorage.getItem(scopedKey(uid)),null);}
  function writeLocal(uid,snapshot,dirty=false,extra={}){
    const prev=readLocal(uid)||{};
    const rec={
      snapshot,
      dirty:Boolean(dirty),
      updatedAt:extra.updatedAt||nowIso(),
      lastSyncedAt:extra.lastSyncedAt!==undefined?extra.lastSyncedAt:(prev.lastSyncedAt||null)
    };
    localStorage.setItem(scopedKey(uid),JSON.stringify(rec));
    return rec;
  }

  function applySnapshot(snap){
    if(!snap||typeof snap!=='object')return;
    applyingRemote=true;
    try{
      if(Array.isArray(snap.shows))state.shows=snap.shows;
      if(Array.isArray(snap.submissions))state.submissions=snap.submissions;
      if(snap.console){state.console=snap.console;localStorage.setItem('fohConsole',snap.console);sessionStorage.setItem('fohSessionConsole',snap.console);}
      if(snap.rtaDisplaySpeed!=null)localStorage.setItem('fohRtaDisplaySpeed',String(snap.rtaDisplaySpeed));
      if(snap.rtaSmoothing!=null)localStorage.setItem('fohRtaSmoothing',String(snap.rtaSmoothing));
      if(snap.lastShowId)localStorage.setItem('fohLastShowId',snap.lastShowId);else localStorage.removeItem('fohLastShowId');

      if(basePersist)basePersist();
      const cs=document.getElementById('consoleSelect');if(cs&&[...cs.options].some(o=>o.value===state.console))cs.value=state.console;
      const ss=document.getElementById('smoothingSelect');if(ss&&snap.rtaSmoothing!=null)ss.value=String(snap.rtaSmoothing);
      const slider=document.getElementById('rtaSpeedSlider');if(slider&&snap.rtaDisplaySpeed!=null){slider.value=String(snap.rtaDisplaySpeed);slider.dispatchEvent(new Event('input',{bubbles:true}));}
      if(typeof renderPresets==='function')renderPresets();
      if(typeof renderShows==='function')renderShows();
      if(typeof renderCommunity==='function')renderCommunity();
      const sd=document.getElementById('showDialog');if(sd?.open)sd.close();
    }finally{applyingRemote=false;}
  }

  function ensureScopedState(user){
    let local=readLocal(user.id);
    if(local){applySnapshot(local.snapshot);return local;}

    const canMigrate=!localStorage.getItem(LEGACY_MIGRATED_KEY)&&meaningfulLegacy();
    const snap=canMigrate?snapshotApp():{schema:1,shows:[],submissions:[],console:state?.console||'generic',rtaDisplaySpeed:localStorage.getItem('fohRtaDisplaySpeed')||'7',rtaSmoothing:localStorage.getItem('fohRtaSmoothing')||'0.68',lastShowId:null};
    local=writeLocal(user.id,snap,canMigrate);
    localStorage.setItem(LEGACY_MIGRATED_KEY,'1');
    applySnapshot(snap);
    return local;
  }

  function setSyncStatus(kind,text){
    const pill=document.getElementById('fohSyncPill');
    if(pill){pill.className=`foh-sync-pill ${kind||''}`;pill.textContent=text;}
    const status=document.getElementById('fohAccountSyncStatus');if(status)status.textContent=text;
    const time=document.getElementById('fohAccountLastSync');
    const local=currentUser?readLocal(currentUser.id):null;
    if(time)time.textContent=local?.lastSyncedAt?new Date(local.lastSyncedAt).toLocaleString():'Not yet';
  }

  function installAccountUi(){
    const settingsBtn=document.getElementById('settingsBtn');
    if(settingsBtn&&!document.getElementById('fohSyncPill')){
      const pill=document.createElement('button');pill.id='fohSyncPill';pill.type='button';pill.className='foh-sync-pill';pill.textContent='Account';pill.addEventListener('click',()=>{
        if(currentUser&&!sb&&navigator.onLine)showGate('login','Log in again to reconnect cloud sync.');
        else document.getElementById('settingsDialog')?.showModal();
      });
      settingsBtn.parentElement.insertBefore(pill,settingsBtn);
    }

    const dialog=document.getElementById('settingsDialog');
    if(dialog&&!document.getElementById('fohAccountPanel')){
      const panel=document.createElement('div');
      panel.id='fohAccountPanel';panel.className='panel foh-account-panel';
      panel.innerHTML=`<span class="eyebrow">ACCOUNT</span>
        <div class="foh-account-row"><span>Email</span><strong id="fohAccountEmail">—</strong></div>
        <div class="foh-account-row"><span>Sync</span><strong id="fohAccountSyncStatus">—</strong></div>
        <div class="foh-account-row"><span>Last synced</span><strong id="fohAccountLastSync">Not yet</strong></div>
        <div class="foh-account-actions"><button class="secondary" id="fohSyncNow" type="button">Sync now</button><button class="danger-button" id="fohSignOut" type="button">Sign out</button></div>
        <p class="foh-sync-note">Changes are always saved on this device first. When online, they are copied to your FOH Toolkit account.</p>`;
      const install=document.getElementById('installBtn');
      if(install)dialog.insertBefore(panel,install);else dialog.appendChild(panel);
      panel.querySelector('#fohSyncNow').addEventListener('click',()=>{
        if(!sb&&navigator.onLine){showGate('login','Log in again to reconnect cloud sync.');return;}
        syncNow(true);
      });
      panel.querySelector('#fohSignOut').addEventListener('click',signOut);
    }
    refreshAccountUi();
  }

  function refreshAccountUi(){
    const email=document.getElementById('fohAccountEmail');if(email)email.textContent=currentUser?.email||'—';
    if(!currentUser)setSyncStatus('problem','Log in');
  }

  function installPersistHook(){
    if(basePersist||typeof persist!=='function')return;
    basePersist=persist;
    persist=function(){
      basePersist();
      if(!currentUser||applyingRemote)return;
      writeLocal(currentUser.id,snapshotApp(),true);
      setSyncStatus(navigator.onLine?'syncing':'offline',navigator.onLine?'Saving…':'Offline · saved');
      scheduleSync();
    };

    document.addEventListener('input',e=>{
      if(e.target?.id!=='rtaSpeedSlider'||!currentUser||applyingRemote)return;
      writeLocal(currentUser.id,snapshotApp(),true);scheduleSync();
    });
    document.addEventListener('change',e=>{
      if(e.target?.id==='smoothingSelect'){
        localStorage.setItem('fohRtaSmoothing',e.target.value);
        if(currentUser&&!applyingRemote){writeLocal(currentUser.id,snapshotApp(),true);scheduleSync();}
      }
    });
  }

  function scheduleSync(){
    clearTimeout(syncTimer);
    if(!navigator.onLine||!sb||!currentUser)return;
    syncTimer=setTimeout(()=>syncNow(),SYNC_DEBOUNCE);
  }

  async function syncNow(force=false){
    if(syncing||!currentUser)return;
    if(!navigator.onLine){setSyncStatus('offline','Offline · saved');return;}
    if(!sb){setSyncStatus('problem','Sign in to sync');return;}
    syncing=true;setSyncStatus('syncing','Syncing…');
    try{
      let local=readLocal(currentUser.id)||writeLocal(currentUser.id,snapshotApp(),true);
      const {data,error}=await sb.from('foh_user_state').select('app_state,updated_at').eq('user_id',currentUser.id).maybeSingle();
      if(error)throw error;

      if(!data||local.dirty||force&&local.dirty){
        const payload={user_id:currentUser.id,app_state:local.snapshot,client_updated_at:local.updatedAt||nowIso()};
        const {error:upsertError}=await sb.from('foh_user_state').upsert(payload,{onConflict:'user_id'});
        if(upsertError)throw upsertError;
        local=writeLocal(currentUser.id,local.snapshot,false,{updatedAt:local.updatedAt,lastSyncedAt:nowIso()});
      }else{
        applySnapshot(data.app_state||{});
        local=writeLocal(currentUser.id,data.app_state||{},false,{updatedAt:data.updated_at||nowIso(),lastSyncedAt:nowIso()});
      }
      setSyncStatus('synced','✓ Synced');
    }catch(err){
      console.warn('FOH sync failed',err);
      const msg=navigator.onLine?'Saved locally':'Offline · saved';
      setSyncStatus(navigator.onLine?'problem':'offline',msg);
    }finally{syncing=false;}
  }

  async function establishUser(user,onlineSession=true){
    if(!user?.id)return;
    currentUser={id:user.id,email:user.email||cachedUser()?.email||''};
    saveCachedUser(currentUser);
    ensureScopedState(currentUser);
    hideGate();installAccountUi();refreshAccountUi();
    setSyncStatus(onlineSession?'syncing':'offline',onlineSession?'Syncing…':'Offline · saved');
    if(onlineSession)scheduleSync();
  }

  async function submitAuth(e){
    e.preventDefault();
    if(!navigator.onLine){setAuthMessage('Internet is required to log in or create an account.','error');return;}
    const email=document.getElementById('fohAuthEmail')?.value.trim();
    const password=document.getElementById('fohAuthPassword')?.value||'';
    const confirm=document.getElementById('fohAuthConfirm')?.value||'';
    if(!email||password.length<8){setAuthMessage('Enter your email and a password of at least 8 characters.','error');return;}
    if(authMode==='signup'&&password!==confirm){setAuthMessage('The passwords do not match.','error');return;}

    setAuthBusy(true);setAuthMessage('');
    try{
      if(!sb){const lib=await loadSupabase();sb=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});wireAuthEvents();}
      if(authMode==='signup'){
        const redirectTo=`${location.origin}${location.pathname}`;
        const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});
        if(error)throw error;
        if(data.session&&data.user){await establishUser(data.user,true);setAuthMessage('Account created.','success');}
        else{
          setAuthMessage('Account created. Check your email to confirm it, then return here and log in.','success');
          setAuthMode('login');
          const emailInput=document.getElementById('fohAuthEmail');if(emailInput)emailInput.value=email;
        }
      }else{
        const {data,error}=await sb.auth.signInWithPassword({email,password});
        if(error)throw error;
        await establishUser(data.user,true);
      }
    }catch(err){setAuthMessage(err?.message||'Could not connect to your account.','error');}
    finally{setAuthBusy(false);}
  }

  let authEventsWired=false;
  function wireAuthEvents(){
    if(!sb||authEventsWired)return;authEventsWired=true;
    sb.auth.onAuthStateChange((event,session)=>{
      if((event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='INITIAL_SESSION')&&session?.user){
        establishUser(session.user,true);
      }
      if(event==='SIGNED_OUT'&&!localStorage.getItem(OFFLINE_USER_KEY))showGate('login');
    });
  }

  async function signOut(){
    clearTimeout(syncTimer);
    if(currentUser&&readLocal(currentUser.id)?.dirty&&navigator.onLine&&sb){try{await syncNow();}catch(_e){}}
    try{if(sb)await sb.auth.signOut({scope:'local'});}catch(_e){}
    localStorage.removeItem(OFFLINE_USER_KEY);
    localStorage.removeItem(`sb-${PROJECT_REF}-auth-token`);
    localStorage.removeItem('fohShows');localStorage.removeItem('fohSubmissions');localStorage.removeItem('fohLastShowId');
    sessionStorage.removeItem('fohSessionConsole');
    location.reload();
  }

  async function bootstrapOnline(){
    try{
      const lib=await loadSupabase();
      sb=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      wireAuthEvents();
      const sessionPromise=sb.auth.getSession();
      const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Auth check timed out')),7000));
      const {data,error}=await Promise.race([sessionPromise,timeout]);
      if(error)throw error;
      if(data?.session?.user){await establishUser(data.session.user,true);return;}
      const cached=cachedUser();
      if(cached){await establishUser(cached,false);setSyncStatus('problem','Sign in to sync');}
      else showGate('login');
    }catch(err){
      console.warn('FOH auth bootstrap failed',err);
      const cached=cachedUser();
      if(cached){await establishUser(cached,false);setSyncStatus('offline','Offline · saved');}
      else showGate('login','Could not reach the account service. Connect to the internet for your first login.');
    }
  }

  function bootstrapOffline(){
    const cached=cachedUser();
    if(cached)establishUser(cached,false);
    else showGate('login','You need an internet connection for your first login on this device.');
  }

  function onOnline(){
    if(sb&&currentUser){syncNow();return;}
    bootstrapOnline();
  }
  function onOffline(){if(currentUser)setSyncStatus('offline','Offline · saved');}

  function ready(){
    loadCss();ensureGate();installPersistHook();installAccountUi();
    const about=document.querySelector('#settingsDialog .about-card p');if(about)about.textContent='Your work is saved locally first and synced securely to your FOH Toolkit account when online.';
    const version=document.getElementById('versionText');if(version)version.textContent='Prototype 1.8.0';
    window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);
    if(navigator.onLine)bootstrapOnline();else bootstrapOffline();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
