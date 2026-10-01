/* FOH Toolkit 3.1 — Community safety: blocks + moderated comments */
(function(){
  'use strict';
  const URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const USER_KEY='fohOfflineUser';
  const BLOCK_LABELS_KEY='fohBlockedCommunityAuthors';
  let client=null,blocked=new Set(),authorLabels={},activePresetId=null,presetAuthors=new Map(),detailObserver=null,profileObserver=null;

  function parse(raw,fallback=null){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function user(){return parse(localStorage.getItem(USER_KEY),null);}
  function role(){return localStorage.getItem('fohCommunityRole')||'member';}
  function isAdmin(){return ['admin','owner'].includes(role());}
  function db(){if(client)return client;if(!window.supabase?.createClient)return null;client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});return client;}
  function saveLabels(){localStorage.setItem(BLOCK_LABELS_KEY,JSON.stringify(authorLabels));}

  async function loadSafetyData(){
    const u=user(),c=db();if(!u?.id||!c||!navigator.onLine)return;
    try{
      const [{data:blocks,error:be},{data:presets,error:pe}]=await Promise.all([
        c.from('community_user_blocks').select('blocked_id').eq('blocker_id',u.id),
        c.from('community_presets').select('id,created_by,author_name,status').eq('status','approved')
      ]);
      if(be)throw be;if(pe)throw pe;
      blocked=new Set((blocks||[]).map(x=>String(x.blocked_id)));
      presetAuthors=new Map((presets||[]).map(x=>[String(x.id),{id:x.created_by?String(x.created_by):null,name:x.author_name||'Community engineer'}]));
      filterBlockedCards();decorateDetail();decorateProfile();if(isAdmin())loadPendingComments();
    }catch(err){console.warn('Community safety load failed',err);}
  }

  function filterBlockedCards(){
    document.querySelectorAll('#communityApproved [data-community-preset]').forEach(card=>{
      const a=presetAuthors.get(String(card.dataset.communityPreset));
      if(a?.id&&blocked.has(a.id))card.hidden=true;
    });
  }

  async function blockAuthor(authorId,label){
    const u=user(),c=db();if(!u?.id||!authorId||authorId===u.id||!c)return;
    if(!navigator.onLine){toast('Connect to the internet to block an engineer');return;}
    if(!confirm(`Block ${label||'this engineer'}? Their Community presets and comments will be hidden from you.`))return;
    try{
      const {error}=await c.from('community_user_blocks').upsert({blocker_id:u.id,blocked_id:authorId},{onConflict:'blocker_id,blocked_id'});if(error)throw error;
      blocked.add(String(authorId));authorLabels[String(authorId)]=label||'Blocked engineer';saveLabels();
      document.getElementById('presetDialog')?.close();filterBlockedCards();decorateProfile();toast('Engineer blocked');
    }catch(err){console.warn(err);toast('Could not block engineer');}
  }

  async function unblockAuthor(authorId){
    const u=user(),c=db();if(!u?.id||!c||!navigator.onLine)return;
    try{
      const {error}=await c.from('community_user_blocks').delete().eq('blocker_id',u.id).eq('blocked_id',authorId);if(error)throw error;
      blocked.delete(String(authorId));delete authorLabels[String(authorId)];saveLabels();decorateProfile();toast('Engineer unblocked');
      setTimeout(()=>{if(typeof renderCommunity==='function')renderCommunity();loadSafetyData();},80);
    }catch(err){console.warn(err);toast('Could not unblock engineer');}
  }

  function decorateDetail(){
    const detail=document.getElementById('presetDetail');if(!detail||!detail.querySelector('.community-separate-note')||!activePresetId)return;
    const u=user(),a=presetAuthors.get(String(activePresetId));if(!u?.id||!a?.id||a.id===u.id)return;
    let panel=detail.querySelector('#v31CommunitySafety');
    if(!panel){panel=document.createElement('div');panel.id='v31CommunitySafety';panel.className='panel';const trust=detail.querySelector('#v3CommunityTrustDetail')||detail.querySelector('.community-separate-note');trust.parentElement.insertBefore(panel,trust.nextSibling);}
    panel.innerHTML=`<span class="eyebrow">COMMUNITY SAFETY</span><p class="helper no-top">Comments are moderated before public display. You can report a preset or block an engineer whose Community content you do not want to see.</p><button type="button" class="secondary full" id="v31BlockAuthor">Block ${esc(a.name||'this engineer')}</button>`;
    panel.querySelector('#v31BlockAuthor')?.addEventListener('click',()=>blockAuthor(a.id,a.name));
    const comments=detail.querySelector('.v3-comments-panel');
    if(comments&&!comments.querySelector('.v31-safety-note'))comments.insertAdjacentHTML('afterbegin','<div class="v31-safety-note">Comments from members are held for moderation before they become public. Admin/Owner comments publish immediately.</div>');
  }

  function decorateProfile(){
    const body=document.getElementById('fohProfileBody');if(!body||!user()?.id)return;
    let card=body.querySelector('#v31BlockedUsers');
    const about=body.querySelector('.profile-about');if(!about)return;
    if(!card){card=document.createElement('div');card.id='v31BlockedUsers';card.className='panel profile-card';body.insertBefore(card,about);}
    const ids=[...blocked];
    card.innerHTML=`<div class="section-mini-head"><div><span class="eyebrow">COMMUNITY SAFETY</span><h3>Blocked engineers</h3></div><span class="count-pill">${ids.length}</span></div><p class="helper no-top">Blocking hides that engineer’s Community presets and comments from your account.</p><div class="list-stack v31-blocked-list">${ids.length?ids.map(id=>`<div class="list-item"><div class="grow"><h4>${esc(authorLabels[id]||'Blocked engineer')}</h4><p>Community content hidden</p></div><button class="mini-btn" data-v31-unblock="${esc(id)}">Unblock</button></div>`).join(''):'<div class="empty-state compact-empty">You have not blocked anyone.</div>'}</div>`;
    card.querySelectorAll('[data-v31-unblock]').forEach(b=>b.addEventListener('click',()=>unblockAuthor(b.dataset.v31Unblock)));
  }

  async function loadPendingComments(){
    if(!isAdmin()||!navigator.onLine)return;
    const hostRoot=document.getElementById('reviewQueue');if(!hostRoot)return;
    let host=document.getElementById('v31PendingComments');
    if(!host){host=document.createElement('div');host.id='v31PendingComments';host.className='v3-report-admin';hostRoot.appendChild(host);}
    try{
      const c=db();if(!c)return;
      const {data,error}=await c.from('community_comments').select('id,preset_id,user_id,author_name,body,status,created_at').eq('status','pending').order('created_at',{ascending:true});if(error)throw error;
      const rows=data||[];
      host.innerHTML=`<div class="section-heading"><div><span class="eyebrow">COMMENT MODERATION</span><h3>Pending comments</h3></div><span class="count-pill">${rows.length}</span></div>${rows.length?rows.map(x=>`<div class="panel v31-moderation-card"><span class="eyebrow">${esc(x.author_name||'Community engineer')}</span><p>${esc(x.body||'')}</p><small>${new Date(x.created_at).toLocaleString()}</small><div class="v31-community-safety-actions"><button class="secondary" data-v31-comment="${esc(x.id)}:rejected">Reject</button><button class="primary" data-v31-comment="${esc(x.id)}:approved">Approve</button></div></div>`).join(''):'<div class="empty-state compact-empty">No comments awaiting review.</div>'}`;
      host.querySelectorAll('[data-v31-comment]').forEach(b=>b.addEventListener('click',()=>{const [id,status]=b.dataset.v31Comment.split(':');moderateComment(id,status);}));
    }catch(err){console.warn(err);host.innerHTML='<div class="empty-state compact-empty">Could not load pending comments.</div>';}
  }

  async function moderateComment(id,status){
    try{
      const {error}=await db().from('community_comments').update({status}).eq('id',id);if(error)throw error;
      toast(status==='approved'?'Comment approved':'Comment rejected');loadPendingComments();
    }catch(err){console.warn(err);toast('Could not update comment');}
  }

  function installObservers(){
    const grid=document.getElementById('communityApproved');
    if(grid){grid.addEventListener('click',e=>{const card=e.target.closest('[data-community-preset]');if(card){activePresetId=String(card.dataset.communityPreset);setTimeout(decorateDetail,35);}},true);new MutationObserver(()=>requestAnimationFrame(filterBlockedCards)).observe(grid,{childList:true,subtree:false});}
    const detail=document.getElementById('presetDetail');
    if(detail&&!detailObserver){let pending=false;detailObserver=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorateDetail();});});detailObserver.observe(detail,{childList:true,subtree:true});}
    const body=document.getElementById('fohProfileBody');
    if(body&&!profileObserver){let pending=false;profileObserver=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorateProfile();});});profileObserver.observe(body,{childList:true,subtree:false});}
  }

  function ready(){
    authorLabels=parse(localStorage.getItem(BLOCK_LABELS_KEY),{})||{};
    installObservers();loadSafetyData();
    document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>setTimeout(decorateProfile,80));
    document.querySelector('[data-community-tab="review"]')?.addEventListener('click',()=>setTimeout(loadPendingComments,80));
    window.addEventListener('online',loadSafetyData);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();