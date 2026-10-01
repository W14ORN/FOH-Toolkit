/* FOH Toolkit 3.1.1 — authenticated Community role refresh */
(function(){
  'use strict';

  const SUPABASE_URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const SUPABASE_KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const USER_KEY='fohOfflineUser';
  const ROLE_KEY='fohCommunityRole';
  const ROLE_USER_KEY='fohCommunityRoleUser';
  let client=null;
  let running=false;
  let retryTimer=null;

  function parse(raw,fallback=null){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function cachedUser(){return parse(localStorage.getItem(USER_KEY),null);}

  async function waitForSupabase(){
    if(window.supabase?.createClient)return window.supabase;
    for(let i=0;i<20;i++){
      await new Promise(r=>setTimeout(r,150));
      if(window.supabase?.createClient)return window.supabase;
    }
    throw new Error('Account service is not ready');
  }

  async function db(){
    if(client)return client;
    const lib=await waitForSupabase();
    client=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    client.auth.onAuthStateChange((_event,session)=>{
      if(session?.user?.id)setTimeout(()=>refreshRole('auth'),30);
    });
    return client;
  }

  function cacheVerifiedRole(userId,role){
    localStorage.setItem(ROLE_KEY,role);
    localStorage.setItem(ROLE_USER_KEY,userId);
    localStorage.setItem(`${ROLE_KEY}:${userId}`,role);
  }

  function protectAgainstCrossAccountCache(){
    const u=cachedUser();if(!u?.id)return;
    const roleUser=localStorage.getItem(ROLE_USER_KEY);
    if(roleUser&&roleUser!==u.id)localStorage.setItem(ROLE_KEY,'member');
  }

  function triggerLegacyRoleRefresh(){
    // upgrade-v13 listens for this event. At this point the shared Supabase session
    // is confirmed, so its own role lookup cannot accidentally run as anon.
    window.dispatchEvent(new Event('online'));
  }

  async function refreshRole(reason='manual'){
    if(running||!navigator.onLine)return;
    const expected=cachedUser();if(!expected?.id)return;
    running=true;clearTimeout(retryTimer);
    try{
      const c=await db();
      const {data:sessionData,error:sessionError}=await c.auth.getSession();
      if(sessionError)throw sessionError;
      const sessionUser=sessionData?.session?.user;
      if(!sessionUser?.id||sessionUser.id!==expected.id){
        retryTimer=setTimeout(()=>refreshRole('session-wait'),500);
        return;
      }
      const {data,error}=await c.rpc('foh_my_role');
      if(error)throw error;
      const verified=['owner','admin','member'].includes(data)?data:'member';
      cacheVerifiedRole(sessionUser.id,verified);
      triggerLegacyRoleRefresh();
      window.dispatchEvent(new CustomEvent('foh:community-role',{detail:{userId:sessionUser.id,role:verified,reason}}));
    }catch(err){
      console.warn('FOH Community role refresh failed',err);
      retryTimer=setTimeout(()=>refreshRole('retry'),900);
    }finally{
      running=false;
    }
  }

  function bindRefreshPoints(){
    document.querySelector('[data-nav="profile"]')?.addEventListener('click',()=>setTimeout(()=>refreshRole('profile'),50));
    document.querySelector('[data-nav="community"]')?.addEventListener('click',()=>setTimeout(()=>refreshRole('community'),50));
    window.addEventListener('online',e=>{
      if(e.isTrusted)setTimeout(()=>refreshRole('online'),40);
    });
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)setTimeout(()=>refreshRole('resume'),80);
    });
  }

  function ready(){
    protectAgainstCrossAccountCache();
    bindRefreshPoints();
    setTimeout(()=>refreshRole('startup'),250);
    setTimeout(()=>refreshRole('startup-late'),1200);
    window.FOHRefreshCommunityRole=refreshRole;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
