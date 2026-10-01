/* FOH Toolkit Prototype 2.0 — cloud community presets + admin roles */
(function(){
  'use strict';

  const SUPABASE_URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const SUPABASE_KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const ROLE_CACHE='fohCommunityRole';
  const COMMUNITY_CACHE='fohCommunityApprovedCache';
  const OFFLINE_USER_KEY='fohOfflineUser';
  const STATE_PREFIX='fohScopedState:';

  let client=null;
  let role=localStorage.getItem(ROLE_CACHE)||'member';
  let rows=[];
  let loading=false;
  let formBound=false;
  let tabsBound=false;
  let profileObserver=null;

  function parseJson(raw,fallback){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function cachedUser(){return parseJson(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function userProfile(){
    const u=cachedUser();if(!u?.id)return {};
    const rec=parseJson(localStorage.getItem(`${STATE_PREFIX}${u.id}`),null);
    return rec?.snapshot?.profile||{};
  }
  function isAdmin(){return role==='owner'||role==='admin';}
  function isOwner(){return role==='owner';}
  function loadCss(){
    if(document.getElementById('fohCommunityCss'))return;
    const l=document.createElement('link');l.id='fohCommunityCss';l.rel='stylesheet';l.href='upgrade-v13.css';document.head.appendChild(l);
  }

  async function ensureClient(){
    if(client)return client;
    if(!window.supabase?.createClient){
      await new Promise((resolve,reject)=>{
        const existing=document.querySelector('script[data-foh-supabase]');
        if(!existing){reject(new Error('Account service is not ready'));return;}
        if(window.supabase?.createClient){resolve();return;}
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',()=>reject(new Error('Account service failed to load')),{once:true});
      });
    }
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});
    return client;
  }

  async function sessionUser(){
    const c=await ensureClient();
    const {data}=await c.auth.getSession();
    return data?.session?.user||null;
  }

  async function loadRole(){
    if(!navigator.onLine){renderRolePanel();return role;}
    try{
      const c=await ensureClient();
      const {data,error}=await c.rpc('foh_my_role');
      if(error)throw error;
      role=data||'member';
      localStorage.setItem(ROLE_CACHE,role);
    }catch(err){console.warn('Community role lookup failed',err);}
    updateAdminVisibility();renderRolePanel();
    return role;
  }

  function rowToPreset(row){
    const parsed=parseSettingsText(row.settings_text||'');
    const eq=Array.isArray(row.eq)&&row.eq.length?row.eq:parsed.eq;
    return {
      id:`community-${row.id}`,
      name:row.name||'Community preset',
      category:row.category||'Other',
      style:row.style||'Community',
      icon:row.icon||'C',
      description:row.description||'',
      why:row.why||'',
      hpf:Number.isFinite(Number(row.hpf))?Number(row.hpf):parsed.hpf,
      lpf:Number.isFinite(Number(row.lpf))?Number(row.lpf):parsed.lpf,
      eq,
      gate:row.gate&&typeof row.gate==='object'?row.gate:null,
      comp:row.comp&&typeof row.comp==='object'?row.comp:null,
      settingsText:row.settings_text||'',
      author:row.author_name||'Community engineer',
      communityId:row.id
    };
  }

  function parseSettingsText(text){
    const t=String(text||'');
    const hp=t.match(/\bHPF\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(k?hz)?/i);
    const lp=t.match(/\bLPF\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(k?hz)?/i);
    const unitVal=m=>{
      if(!m)return null;
      let n=Number(m[1]);if(!Number.isFinite(n))return null;
      if(String(m[2]||'').toLowerCase()==='khz')n*=1000;
      return n;
    };
    const eq=[];
    const re=/([+-]?\d+(?:\.\d+)?)\s*dB\s*@\s*(\d+(?:\.\d+)?)\s*(kHz|Hz)?(?:\s*[·,;-]?\s*Q\s*(\d+(?:\.\d+)?))?/gi;
    let m;
    while((m=re.exec(t))&&eq.length<8){
      let f=Number(m[2]);if(String(m[3]||'').toLowerCase()==='khz')f*=1000;
      eq.push({f,g:Number(m[1]),q:Number(m[4]||1.4)});
    }
    return {hpf:unitVal(hp),lpf:unitVal(lp),eq};
  }

  function authorName(){
    const p=userProfile();
    return (p.displayName||p.company||'Community engineer').trim().slice(0,80)||'Community engineer';
  }

  async function loadCommunity(){
    if(loading)return;
    loading=true;
    try{
      if(!navigator.onLine){
        rows=parseJson(localStorage.getItem(COMMUNITY_CACHE),[])||[];
        renderCommunityModern();
        return;
      }
      await loadRole();
      const c=await ensureClient();
      const {data,error}=await c.from('community_presets').select('*').order('created_at',{ascending:false});
      if(error)throw error;
      rows=Array.isArray(data)?data:[];
      const approved=rows.filter(r=>r.status==='approved');
      localStorage.setItem(COMMUNITY_CACHE,JSON.stringify(approved));
      renderCommunityModern();
    }catch(err){
      console.warn('Community load failed',err);
      rows=parseJson(localStorage.getItem(COMMUNITY_CACHE),[])||[];
      renderCommunityModern();
      if(typeof toast==='function'&&navigator.onLine)toast('Community could not refresh · showing saved copy');
    }finally{loading=false;}
  }

  function activeCommunityPane(){
    return document.querySelector('[data-community-tab].active')?.dataset.communityTab||'approved';
  }

  function bindTabs(){
    if(tabsBound)return;tabsBound=true;
    document.querySelectorAll('[data-community-tab]').forEach(old=>{
      const fresh=old.cloneNode(true);old.replaceWith(fresh);
      fresh.addEventListener('click',()=>{
        document.querySelectorAll('[data-community-tab]').forEach(x=>x.classList.toggle('active',x===fresh));
        document.querySelectorAll('[data-community-pane]').forEach(p=>p.classList.toggle('active',p.dataset.communityPane===fresh.dataset.communityTab));
        renderCommunityModern();
      });
    });
  }

  function enhanceForm(){
    const form=document.getElementById('communityForm');if(!form)return null;
    if(!form.querySelector('[name="why"]')){
      const settingsField=form.querySelector('textarea[name="settings"]')?.closest('.field');
      const field=document.createElement('div');field.className='field';
      field.innerHTML='<label>Why does it work?</label><textarea name="why" rows="3" placeholder="Explain what the EQ/dynamics are trying to achieve."></textarea>';
      if(settingsField)form.insertBefore(field,settingsField);else form.appendChild(field);
    }
    const helper=form.querySelector('.helper');
    if(helper)helper.textContent=isAdmin()?'You are an admin. New presets you add here are published to Community immediately.':'Your submission goes to the admin review queue before it appears publicly.';
    const submit=form.querySelector('button[type="submit"]');if(submit)submit.textContent=isAdmin()?'Publish community preset':'Submit for approval';
    let mine=document.getElementById('communityMySubmissions');
    if(!mine){mine=document.createElement('div');mine.id='communityMySubmissions';mine.className='community-my-submissions';form.insertAdjacentElement('afterend',mine);}
    return form;
  }

  function bindForm(){
    if(formBound)return;
    const old=document.getElementById('communityForm');if(!old)return;
    const fresh=old.cloneNode(true);old.replaceWith(fresh);formBound=true;
    enhanceForm();
    fresh.addEventListener('submit',submitCommunity);
  }

  async function submitCommunity(e){
    e.preventDefault();
    if(!navigator.onLine){toast('Connect to the internet to submit a community preset');return;}
    const form=e.currentTarget,fd=new FormData(form);
    const settings=String(fd.get('settings')||'').trim();
    const parsed=parseSettingsText(settings);
    try{
      const c=await ensureClient(),u=await sessionUser();
      if(!u)throw new Error('Sign in again to submit');
      const approved=isAdmin();
      const payload={
        name:String(fd.get('name')||'').trim(),
        category:String(fd.get('category')||'').trim(),
        style:String(fd.get('style')||'').trim(),
        description:String(fd.get('description')||'').trim(),
        why:String(fd.get('why')||'').trim(),
        settings_text:settings,
        hpf:parsed.hpf,
        lpf:parsed.lpf,
        eq:parsed.eq,
        author_name:authorName(),
        created_by:u.id,
        status:approved?'approved':'pending',
        approved_by:approved?u.id:null,
        approved_at:approved?new Date().toISOString():null
      };
      const {error}=await c.from('community_presets').insert(payload);if(error)throw error;
      form.reset();toast(approved?'Community preset published':'Submitted for admin review');
      await loadCommunity();
      document.querySelector(`[data-community-tab="${approved?'approved':'submit'}"]`)?.click();
    }catch(err){console.warn(err);toast(err?.message||'Could not submit preset');}
  }

  function updateAdminVisibility(){
    const review=document.querySelector('[data-community-tab="review"]');
    if(review){review.hidden=!isAdmin();review.textContent=isAdmin()?'Admin':'Review queue';}
    const pane=document.querySelector('[data-community-pane="review"]');if(pane)pane.hidden=!isAdmin();
    enhanceForm();
  }

  function cardHtml(row){
    const p=rowToPreset(row),g=typeof groupForPreset==='function'?groupForPreset(p):{color:'#46d7a4',soft:'rgba(70,215,164,.14)',name:'Community'};
    return `<article class="preset-card grouped-card community-card" data-community-preset="${esc(row.id)}" style="--group:${g.color};--group-soft:${g.soft}">
      <span class="verified community-approved-label">COMMUNITY</span>
      <div class="group-ribbon">${esc(g.name||p.category)}</div>
      <div class="category-icon">${esc(p.icon||'C')}</div>
      <h4>${esc(p.name)}</h4><p>${esc(p.style||p.category)}</p>
      <small class="community-author">By ${esc(p.author)}</small>
    </article>`;
  }

  function renderMySubmissions(){
    const el=document.getElementById('communityMySubmissions');if(!el)return;
    const mine=rows.filter(r=>r.status!=='approved');
    if(!mine.length){el.innerHTML='';return;}
    el.innerHTML=`<div class="section-heading community-submission-heading"><div><span class="eyebrow">YOUR ACTIVITY</span><h3>Submissions</h3></div></div><div class="list-stack">${mine.map(r=>`<div class="list-item"><div class="grow"><h4>${esc(r.name)}</h4><p>${esc(r.category)} · ${esc(r.style)}</p></div><span class="community-status ${esc(r.status)}">${esc(r.status.toUpperCase())}</span></div>`).join('')}</div>`;
  }

  function adminQueueHtml(){
    if(!isAdmin())return '<div class="empty-state">Admin access is required.</div>';
    const pending=rows.filter(r=>r.status==='pending');
    const approved=rows.filter(r=>r.status==='approved');
    return `<div class="community-admin-head"><span class="eyebrow">COMMUNITY ADMIN</span><h3>Pending review</h3><p>Approve submissions before they appear in the Community library.</p></div>
      <div class="list-stack">${pending.length?pending.map(r=>`<div class="panel community-review-card"><span class="eyebrow">PENDING · ${esc(r.category)}</span><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><pre>${esc(r.settings_text||'No settings supplied')}</pre><div class="button-row"><button class="primary" data-community-approve="${esc(r.id)}">Approve</button><button class="danger-button" data-community-delete="${esc(r.id)}">Remove</button></div></div>`).join(''):'<div class="empty-state">No presets waiting for review.</div>'}</div>
      <div class="section-heading community-manage-heading"><div><span class="eyebrow">PUBLISHED</span><h3>Manage community presets</h3></div><span class="count-pill">${approved.length}</span></div>
      <div class="list-stack">${approved.length?approved.map(r=>`<div class="list-item"><div class="grow"><h4>${esc(r.name)}</h4><p>${esc(r.category)} · ${esc(r.style)}</p></div><button class="mini-btn danger-mini" data-community-delete="${esc(r.id)}">Remove</button></div>`).join(''):'<div class="empty-state">No published community presets yet.</div>'}</div>`;
  }

  function renderCommunityModern(){
    const approvedEl=document.getElementById('communityApproved');
    if(approvedEl){
      const approved=rows.filter(r=>r.status==='approved');
      approvedEl.innerHTML=approved.length?approved.map(cardHtml).join(''):'<div class="empty-state" style="grid-column:1/-1">No approved community presets yet.</div>';
      approvedEl.querySelectorAll('[data-community-preset]').forEach(card=>card.addEventListener('click',()=>openCommunityPreset(card.dataset.communityPreset)));
    }
    enhanceForm();renderMySubmissions();
    const review=document.getElementById('reviewQueue');if(review)review.innerHTML=adminQueueHtml();
    document.querySelectorAll('[data-community-approve]').forEach(b=>b.addEventListener('click',()=>approvePreset(b.dataset.communityApprove)));
    document.querySelectorAll('[data-community-delete]').forEach(b=>b.addEventListener('click',()=>removePreset(b.dataset.communityDelete)));
    updateAdminVisibility();
  }

  async function approvePreset(id){
    if(!isAdmin()||!navigator.onLine)return;
    try{
      const c=await ensureClient(),u=await sessionUser();
      const {error}=await c.from('community_presets').update({status:'approved',approved_by:u?.id||null,approved_at:new Date().toISOString()}).eq('id',id);
      if(error)throw error;toast('Community preset approved');await loadCommunity();
    }catch(err){toast(err?.message||'Could not approve preset');}
  }

  async function removePreset(id){
    if(!isAdmin()||!navigator.onLine)return;
    const item=rows.find(r=>r.id===id);if(!item)return;
    if(!confirm(`Remove ${item.name} from Community?`))return;
    try{
      const c=await ensureClient();const {error}=await c.from('community_presets').delete().eq('id',id);if(error)throw error;
      toast('Community preset removed');document.getElementById('presetDialog')?.close();await loadCommunity();
    }catch(err){toast(err?.message||'Could not remove preset');}
  }

  function settingTextBlock(p){
    if(!p.settingsText)return '';
    return `<div class="why-box community-settings-text"><strong>Submitted settings</strong><br><span>${esc(p.settingsText)}</span></div>`;
  }

  function dynamicsHtml(p){
    let html='';
    if(p.gate)html+=Object.entries(p.gate).map(([k,v])=>`<div class="setting"><span>Gate ${esc(k)}</span><strong>${typeof formatDyn==='function'?formatDyn(k,v):esc(v)}</strong></div>`).join('');
    else html+='<div class="setting"><span>Gate</span><strong>Not specified</strong></div>';
    if(p.comp)html+=Object.entries(p.comp).map(([k,v])=>`<div class="setting"><span>Comp ${esc(k)}</span><strong>${typeof formatDyn==='function'?formatDyn(k,v):esc(v)}</strong></div>`).join('');
    else html+='<div class="setting"><span>Compressor</span><strong>See submitted settings</strong></div>';
    return html;
  }

  function openCommunityPreset(id){
    const row=rows.find(r=>r.id===id&&r.status==='approved');if(!row)return;
    const p=rowToPreset(row),desk=typeof getDeskProfile==='function'?getDeskProfile(state.console):null;
    const detail=document.getElementById('presetDetail'),dialog=document.getElementById('presetDialog');if(!detail||!dialog)return;
    detail.innerHTML=`
      <div class="detail-head"><span class="eyebrow">COMMUNITY · ${esc(String(p.category).toUpperCase())}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p></div>
      <div class="detail-badges"><span class="badge community-badge">COMMUNITY APPROVED</span><span class="badge">${esc(p.style||'Community')}</span><span class="badge">By ${esc(p.author)}</span></div>
      ${desk?`<div class="translation-note"><strong>${esc(desk.name)}</strong><br>${esc(desk.note||'Use these values as a starting point and confirm them on the desk.')}</div>`:''}
      ${p.eq.length?'<div class="eq-card"><canvas id="communityEqCanvas" width="900" height="320"></canvas></div>':''}
      <div class="processing-grid">
        <div class="processing-block"><h4>Filters & EQ</h4><div class="setting-list">
          <div class="setting"><span>HPF</span><strong>${p.hpf?esc(`${p.hpf} Hz`):'Not specified'}</strong></div>
          <div class="setting"><span>LPF</span><strong>${p.lpf?(typeof fmtFreq==='function'?fmtFreq(p.lpf):esc(`${p.lpf} Hz`)):'Not specified'}</strong></div>
          ${p.eq.length?p.eq.map((b,i)=>`<div class="setting"><span>Band ${i+1}</span><strong>${Number(b.g)>0?'+':''}${esc(b.g)} dB @ ${typeof fmtFreq==='function'?fmtFreq(Number(b.f)):esc(b.f)} · Q ${esc(b.q)}</strong></div>`).join(''):'<div class="setting"><span>PEQ</span><strong>See submitted settings</strong></div>'}
        </div></div>
        <div class="processing-block"><h4>Dynamics</h4><div class="setting-list">${dynamicsHtml(p)}</div></div>
      </div>
      ${p.why?`<div class="why-box"><strong>Why the engineer uses this</strong><br>${esc(p.why)}</div>`:''}
      ${settingTextBlock(p)}
      ${isAdmin()?`<button class="danger-button full community-detail-remove" id="removeCommunityPreset" type="button">Remove from Community</button>`:''}
      <p class="helper community-separate-note">Community presets are kept separate from the official FOH Toolkit preset library and are not marked as FOH Toolkit verified.</p>`;
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
    requestAnimationFrame(()=>{const canvas=document.getElementById('communityEqCanvas');if(canvas&&typeof drawEqCurve==='function')drawEqCurve(canvas,p);});
    document.getElementById('removeCommunityPreset')?.addEventListener('click',()=>removePreset(row.id));
  }

  async function renderRolePanel(){
    const body=document.getElementById('fohProfileBody');if(!body)return;
    let panel=document.getElementById('communityRolePanel');
    if(!panel){
      panel=document.createElement('div');panel.id='communityRolePanel';panel.className='panel profile-card community-role-panel';
      const about=body.querySelector('.profile-about');if(about)body.insertBefore(panel,about);else body.appendChild(panel);
    }
    const label=role==='owner'?'Owner':role==='admin'?'Admin':'Member';
    panel.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">ACCESS</span><h3>Community role</h3></div><span class="role-badge role-${esc(role)}">${esc(label)}</span></div>
      <p class="helper no-top">${isAdmin()?'You can approve, publish and remove Community presets.':'You can submit presets for review. Approved presets remain separate from the official preset library.'}</p>
      ${isOwner()?`<div class="community-owner-tools"><div class="field"><label for="communityAdminEmail">Add admin by account email</label><div class="community-admin-add"><input id="communityAdminEmail" type="email" placeholder="engineer@example.com" autocomplete="email"><button class="secondary" id="addCommunityAdmin" type="button">Add</button></div></div><div id="communityAdminList" class="list-stack"><div class="empty-state">Loading admins…</div></div></div>`:''}`;
    document.getElementById('addCommunityAdmin')?.addEventListener('click',addAdmin);
    if(isOwner())loadAdminList();
  }

  async function loadAdminList(){
    const list=document.getElementById('communityAdminList');if(!list||!isOwner())return;
    if(!navigator.onLine){list.innerHTML='<div class="empty-state">Connect to manage admins.</div>';return;}
    try{
      const c=await ensureClient();const {data,error}=await c.rpc('foh_list_admins');if(error)throw error;
      list.innerHTML=(data||[]).map(a=>`<div class="list-item community-admin-row"><div class="grow"><h4>${esc(a.email)}</h4><p>${esc(a.role)}</p></div>${a.role==='admin'?`<button class="mini-btn danger-mini" data-remove-admin="${esc(a.email)}">Remove</button>`:'<span class="role-badge role-owner">OWNER</span>'}</div>`).join('')||'<div class="empty-state">No admins added yet.</div>';
      list.querySelectorAll('[data-remove-admin]').forEach(b=>b.addEventListener('click',()=>setAdmin(b.dataset.removeAdmin,false)));
    }catch(err){list.innerHTML=`<div class="empty-state">${esc(err?.message||'Could not load admins')}</div>`;}
  }

  async function addAdmin(){
    const input=document.getElementById('communityAdminEmail');const email=input?.value.trim();if(!email)return;
    await setAdmin(email,true);if(input)input.value='';
  }

  async function setAdmin(email,makeAdmin){
    if(!isOwner()||!navigator.onLine)return;
    if(!makeAdmin&&!confirm(`Remove admin access for ${email}?`))return;
    try{
      const c=await ensureClient();const {error}=await c.rpc('foh_set_admin_by_email',{target_email:email,make_admin:makeAdmin});if(error)throw error;
      toast(makeAdmin?'Admin access added':'Admin access removed');await loadAdminList();
    }catch(err){toast(err?.message||'Could not change admin access');}
  }

  function watchProfile(){
    const body=document.getElementById('fohProfileBody');if(!body||profileObserver)return;
    let scheduled=false;
    profileObserver=new MutationObserver(()=>{
      if(scheduled)return;scheduled=true;
      setTimeout(()=>{scheduled=false;if(document.getElementById('screen-profile')?.classList.contains('active'))renderRolePanel();},30);
    });
    profileObserver.observe(body,{childList:true});
    document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>setTimeout(renderRolePanel,60));
  }

  function installCommunityBindings(){
    bindTabs();bindForm();updateAdminVisibility();
    const screen=document.getElementById('screen-community');
    if(screen&&!screen.dataset.cloudCommunity){
      screen.dataset.cloudCommunity='1';
      const hero=screen.querySelector('.hero p');if(hero)hero.textContent='Engineer-submitted presets kept separate from the official library. Open any approved preset to read the full setup.';
    }
    renderCommunity=renderCommunityModern;
  }

  async function ready(){
    loadCss();installCommunityBindings();watchProfile();
    const version=document.getElementById('versionText');if(version)version.textContent='Prototype 2.0.0';
    await loadRole();await loadCommunity();renderRolePanel();
    window.addEventListener('online',()=>{loadRole();loadCommunity();});
    window.addEventListener('offline',()=>{rows=parseJson(localStorage.getItem(COMMUNITY_CACHE),[])||[];renderCommunityModern();renderRolePanel();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();
