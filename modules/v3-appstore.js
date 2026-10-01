/* FOH Toolkit 3.1 — App Store account / guest / legal readiness */
(function(){
  'use strict';
  const SUPABASE_URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const SUPABASE_KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const USER_KEY='fohOfflineUser';
  const GUEST_KEY='fohGuestMode';
  const GUEST_BACKUP='fohGuestBackup';
  const STATE_PREFIX='fohScopedState:';
  let client=null, profileObserver=null, gateObserver=null;

  function parse(raw,fallback=null){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function user(){return parse(localStorage.getItem(USER_KEY),null);}
  function isGuest(){return localStorage.getItem(GUEST_KEY)==='1'&&!user()?.id;}
  function db(){
    if(client)return client;
    if(!window.supabase?.createClient)return null;
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }

  function addLegalLinks(host){
    if(!host||host.querySelector('.v31-legal-links'))return;
    const box=document.createElement('div');box.className='v31-legal-links';
    box.innerHTML='<a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a><span>·</span><a href="terms.html" target="_blank" rel="noopener">Terms</a><span>·</span><a href="community-guidelines.html" target="_blank" rel="noopener">Community Guidelines</a><span>·</span><a href="support.html" target="_blank" rel="noopener">Support</a>';
    host.appendChild(box);
  }

  function backupGuestWork(){
    if(!isGuest())return;
    const snap={savedAt:new Date().toISOString(),shows:Array.isArray(state?.shows)?state.shows:[],submissions:Array.isArray(state?.submissions)?state.submissions:[],console:state?.console||localStorage.getItem('fohConsole')||'generic',rtaDisplaySpeed:localStorage.getItem('fohRtaDisplaySpeed')||'7',rtaSmoothing:localStorage.getItem('fohRtaSmoothing')||'0.68'};
    if(snap.shows.length||snap.submissions.length||snap.console!=='generic')localStorage.setItem(GUEST_BACKUP,JSON.stringify(snap));
  }

  function showAuth(mode='login'){
    backupGuestWork();
    localStorage.removeItem(GUEST_KEY);
    const gate=document.getElementById('fohAuthGate');
    if(gate)gate.hidden=false;
    const tab=document.querySelector(`[data-auth-mode="${mode}"]`);if(tab)tab.click();
    setTimeout(()=>document.getElementById('fohAuthEmail')?.focus(),30);
  }

  function enterGuest(){
    localStorage.setItem(GUEST_KEY,'1');
    const gate=document.getElementById('fohAuthGate');if(gate)gate.hidden=true;
    const pill=document.getElementById('fohSyncPill');if(pill){pill.textContent='Guest · local only';pill.className='foh-sync-pill offline';}
    if(typeof toast==='function')toast('Guest mode · saved on this device only');
    decorateProfile();
  }

  function ensureGuestChoice(){
    const gate=document.getElementById('fohAuthGate'),card=gate?.querySelector('.foh-auth-card');if(!card)return;
    if(!card.querySelector('#fohGuestContinue')){
      const wrap=document.createElement('div');wrap.className='v31-auth-extra';
      wrap.innerHTML='<div class="v31-or"><span>or</span></div><button type="button" class="secondary full" id="fohGuestContinue">Continue without an account</button><p class="foh-auth-foot">Guest mode gives full access to Presets, Shows, RTA and Ring Out. Cloud sync and Community posting require an account.</p>';
      const loading=card.querySelector('#fohAuthLoading');card.insertBefore(wrap,loading||card.lastChild);
      wrap.querySelector('#fohGuestContinue').addEventListener('click',enterGuest);
    }
    addLegalLinks(card);
    if(isGuest())gate.hidden=true;
    if(!gate._v31HiddenObserver){gate._v31HiddenObserver=new MutationObserver(()=>{if(isGuest()&&!gate.hidden)gate.hidden=true;});gate._v31HiddenObserver.observe(gate,{attributes:true,attributeFilter:['hidden']});}
  }

  function guestProfile(body){
    if(!isGuest()||!body)return false;
    if(body.querySelector('#v31GuestLogin'))return true;
    body.innerHTML=`<div class="panel profile-identity-card"><div class="profile-avatar">G</div><div class="profile-identity-copy"><span class="eyebrow">GUEST MODE</span><h3>Local-only workspace</h3><p>No account required</p></div></div>
      <div class="panel profile-card"><div class="section-mini-head"><div><span class="eyebrow">ACCOUNT OPTIONAL</span><h3>Keep working without signing in</h3></div></div><p class="helper no-top">Presets, Shows, RTA and Ring Out work in guest mode and save on this device. Sign in only if you want cloud sync, Community posting, ratings or comments.</p><div class="profile-actions"><button class="primary" id="v31GuestLogin">Log in</button><button class="secondary" id="v31GuestSignup">Create account</button></div></div>
      <div class="panel profile-card"><span class="eyebrow">DATA</span><h3>Your guest data stays local</h3><p class="helper">Deleting browser/app data or uninstalling before creating an account can remove guest shows and settings. If you later sign in, FOH Toolkit keeps a guest backup so you can import it into the account.</p></div>
      <div class="panel profile-card profile-about"><span class="eyebrow">FOH TOOLKIT</span><div class="profile-stat-row"><span>Version</span><strong>Prototype 3.1.0</strong></div></div>`;
    body.querySelector('#v31GuestLogin')?.addEventListener('click',()=>showAuth('login'));
    body.querySelector('#v31GuestSignup')?.addEventListener('click',()=>showAuth('signup'));
    addLegalLinks(body.querySelector('.profile-about'));
    return true;
  }

  function clearDeletedAccountLocal(uid){
    localStorage.removeItem(USER_KEY);localStorage.removeItem(GUEST_KEY);localStorage.removeItem(GUEST_BACKUP);localStorage.removeItem('fohCommunityRole');
    if(uid)localStorage.removeItem(`${STATE_PREFIX}${uid}`);
    ['fohShows','fohSubmissions','fohLastShowId','fohConsole','fohRtaDisplaySpeed','fohRtaSmoothing','fohCommunityApprovedCache'].forEach(k=>localStorage.removeItem(k));
    sessionStorage.removeItem('fohSessionConsole');
    Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(Boolean).filter(k=>k.startsWith('fohCommunityFavourites:')||k.startsWith('fohOfficial')).forEach(k=>localStorage.removeItem(k));
  }

  async function deleteAccount(){
    const u=user();if(!u?.id)return;
    if(!navigator.onLine){toast('Connect to the internet to delete your account');return;}
    if(!confirm('Delete your FOH Toolkit account and associated cloud data? This cannot be undone.'))return;
    const typed=prompt('Type DELETE to permanently delete your account.');if(typed!=='DELETE')return;
    const button=document.getElementById('v31DeleteAccount');if(button){button.disabled=true;button.textContent='Deleting…';}
    try{
      const c=db();if(!c)throw new Error('Account service is still loading');
      const {error}=await c.rpc('foh_delete_own_account');if(error)throw error;
      try{await c.auth.signOut({scope:'local'});}catch(_e){}
      clearDeletedAccountLocal(u.id);
      alert('Your FOH Toolkit account and associated data have been deleted.');
      location.reload();
    }catch(err){console.warn(err);toast(err?.message||'Account deletion failed');if(button){button.disabled=false;button.textContent='Delete account';}}
  }

  function accountSafetyCard(body){
    if(!user()?.id||!body||body.querySelector('#v31AccountSafety'))return;
    const about=body.querySelector('.profile-about');if(!about)return;
    const card=document.createElement('div');card.id='v31AccountSafety';card.className='panel profile-card v31-account-safety';
    card.innerHTML='<div class="section-mini-head"><div><span class="eyebrow">ACCOUNT & PRIVACY</span><h3>Account controls</h3></div></div><p class="helper no-top">You can permanently delete your FOH Toolkit account from the app. Your saved account state and user-generated Community content associated with your account are removed.</p><button type="button" class="danger-button full" id="v31DeleteAccount">Delete account</button>';
    body.insertBefore(card,about);card.querySelector('#v31DeleteAccount').addEventListener('click',deleteAccount);
    addLegalLinks(about);
  }

  function importGuestBackup(body){
    const u=user(),backup=parse(localStorage.getItem(GUEST_BACKUP),null);if(!u?.id||!backup||!body||body.querySelector('#v31GuestImport'))return;
    const about=body.querySelector('.profile-about');if(!about)return;
    const card=document.createElement('div');card.id='v31GuestImport';card.className='panel profile-card';
    const count=Array.isArray(backup.shows)?backup.shows.length:0;
    card.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">GUEST BACKUP</span><h3>Import guest work?</h3></div></div><p class="helper no-top">A local guest backup from ${backup.savedAt?new Date(backup.savedAt).toLocaleString():'this device'} contains ${count} show${count===1?'':'s'}. Importing adds those shows to this account without replacing existing cloud shows.</p><div class="profile-actions"><button class="primary" id="v31ImportGuest">Import</button><button class="secondary" id="v31DiscardGuest">Discard backup</button></div>`;
    body.insertBefore(card,about);
    card.querySelector('#v31ImportGuest')?.addEventListener('click',()=>{
      const existing=new Set((state.shows||[]).map(s=>s.id));const incoming=(backup.shows||[]).filter(s=>!existing.has(s.id));state.shows=[...(state.shows||[]),...incoming];
      if((state.console||'generic')==='generic'&&backup.console)state.console=backup.console;
      localStorage.removeItem(GUEST_BACKUP);if(typeof persist==='function')persist();if(typeof renderShows==='function')renderShows();toast(`${incoming.length} guest show${incoming.length===1?'':'s'} imported`);card.remove();
    });
    card.querySelector('#v31DiscardGuest')?.addEventListener('click',()=>{if(confirm('Discard the local guest backup?')){localStorage.removeItem(GUEST_BACKUP);card.remove();}});
  }

  function decorateProfile(){
    const body=document.getElementById('fohProfileBody');if(!body)return;
    if(guestProfile(body))return;
    accountSafetyCard(body);importGuestBackup(body);
    const about=body.querySelector('.profile-about');if(about)addLegalLinks(about);
  }

  function installObservers(){
    ensureGuestChoice();
    if(!gateObserver){gateObserver=new MutationObserver(()=>ensureGuestChoice());gateObserver.observe(document.body,{childList:true,subtree:true});}
    const body=document.getElementById('fohProfileBody');
    if(body&&!profileObserver){let scheduled=false;profileObserver=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorateProfile();});});profileObserver.observe(body,{childList:true,subtree:false});}
  }

  function keepGuestHidden(){if(!isGuest())return;const gate=document.getElementById('fohAuthGate');if(gate)gate.hidden=true;const pill=document.getElementById('fohSyncPill');if(pill){pill.textContent='Guest · local only';pill.className='foh-sync-pill offline';}}

  function ready(){
    ensureGuestChoice();installObservers();decorateProfile();
    document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>setTimeout(decorateProfile,40));
    if(isGuest())setTimeout(keepGuestHidden,80);
    window.addEventListener('online',()=>setTimeout(keepGuestHidden,30));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(keepGuestHidden,30);});
    window.FOHAccount={showAuth,enterGuest,isGuest,user};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();