/* FOH Toolkit 3.1.3 — central module bootstrap */
(function(){
  'use strict';
  const css='modules/v3.css';
  const VERSION='Prototype 3.1.3';
  window.FOH_VERSION=VERSION;
  const modules=['modules/v3-extra-presets.js','modules/v3-category-refresh.js','modules/v3-groups.js','modules/v3-preset-families.js','modules/v3-core.js','modules/v3-state.js','modules/v3-console.js','modules/v3-rta.js','modules/v3-ringout.js','modules/v3-legacy-bridge.js','modules/v3-shows.js','modules/v3-hardware.js','modules/v3-hardware-guard.js','modules/v3-hardware-routing.js','modules/v3-export.js','modules/v3-community.js','modules/v3-community-context.js','modules/v3-community-safety.js','modules/v3-appstore.js','modules/v3-role-refresh.js','modules/v3-release-polish.js'];
  function ensureCss(){if(document.querySelector(`link[href="${css}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=css;l.dataset.fohV3='css';document.head.appendChild(l);}
  function load(src){return new Promise((resolve,reject)=>{let s=document.querySelector(`script[src="${src}"]`);if(s){if(s.dataset.loaded==='1')return resolve();s.addEventListener('load',resolve,{once:true});s.addEventListener('error',reject,{once:true});return;}s=document.createElement('script');s.src=src;s.defer=true;s.dataset.fohV3='1';s.addEventListener('load',()=>{s.dataset.loaded='1';resolve();},{once:true});s.addEventListener('error',reject,{once:true});document.head.appendChild(s);});}
  function setVersion(){const v=document.getElementById('versionText');if(v)v.textContent=VERSION;document.querySelectorAll('#fohProfileBody .profile-about .profile-stat-row').forEach(row=>{if(row.querySelector('span')?.textContent?.trim().toLowerCase()==='version'){const strong=row.querySelector('strong');if(strong)strong.textContent=VERSION;}});document.documentElement.dataset.fohVersion='3.1.3';}
  async function ready(){ensureCss();for(const src of modules){try{await load(src);}catch(err){console.error(`FOH Toolkit module failed: ${src}`,err);}}setVersion();setTimeout(setVersion,700);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>ready(),{once:true});else ready();
})();