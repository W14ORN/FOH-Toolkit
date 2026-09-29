/* FOH Toolkit Prototype 1.7.1 — Add to show dropdown */
(function(){
  'use strict';

  let pendingPreset=null;
  const baseChooseShowForPreset=chooseShowForPreset;
  const LAST_SHOW_KEY='fohLastShowId';

  function ensureDialog(){
    let d=document.getElementById('addToShowDialog');
    if(d)return d;

    d=document.createElement('dialog');
    d.id='addToShowDialog';
    d.className='sheet-dialog small-sheet';
    d.innerHTML=`
      <div class="sheet-handle"></div>
      <div class="dialog-heading">
        <span class="eyebrow">PRESET</span>
        <h2>Add to show</h2>
        <p id="addToShowPresetName" class="helper"></p>
      </div>
      <div class="panel settings-list">
        <div class="field-row" style="display:block">
          <label for="addToShowSelect" style="display:block;margin-bottom:.45rem">Show</label>
          <select id="addToShowSelect" style="width:100%"></select>
        </div>
      </div>
      <div class="button-row">
        <button class="primary" id="confirmAddToShow">Add to show</button>
        <button class="secondary" id="cancelAddToShow">Cancel</button>
      </div>
      <button class="icon-button close-sheet" id="closeAddToShow" aria-label="Close">×</button>`;
    document.body.appendChild(d);

    d.querySelector('#confirmAddToShow').addEventListener('click',addSelectedShow);
    d.querySelector('#cancelAddToShow').addEventListener('click',()=>d.close());
    d.querySelector('#closeAddToShow').addEventListener('click',()=>d.close());
    d.addEventListener('click',e=>{if(e.target===d)d.close();});
    return d;
  }

  function showLabel(show){
    const desk=typeof getDeskProfile==='function'?getDeskProfile(show.console).name:(show.console||'Desk');
    return `${show.name} — ${desk} — ${show.channels.length} CH`;
  }

  function openShowDropdown(preset){
    ensureShowDefaults();
    if(!state.shows.length){
      baseChooseShowForPreset(preset);
      return;
    }

    pendingPreset=preset;
    const d=ensureDialog();
    const select=d.querySelector('#addToShowSelect');
    const last=localStorage.getItem(LAST_SHOW_KEY);
    select.innerHTML=state.shows.map(show=>`<option value="${esc(show.id)}" ${show.id===last?'selected':''}>${esc(showLabel(show))}</option>`).join('');
    if(!select.value&&state.shows[0])select.value=state.shows[0].id;
    d.querySelector('#addToShowPresetName').textContent=preset?.name||'Selected preset';
    if(!d.open)d.showModal();
    d.scrollTop=0;
  }

  function addSelectedShow(){
    const d=document.getElementById('addToShowDialog');
    const select=document.getElementById('addToShowSelect');
    if(!pendingPreset||!select)return;

    const index=state.shows.findIndex(show=>show.id===select.value);
    if(index<0){toast('That show is no longer available');return;}

    const selectedShow=state.shows[index];
    localStorage.setItem(LAST_SHOW_KEY,selectedShow.id);

    // Reuse the existing show-add routine so all current desk/stagebox auto-patch
    // behaviour stays exactly the same, but answer its old numeric prompt
    // internally instead of showing it to the user.
    const realPrompt=window.prompt;
    window.prompt=()=>String(index+1);
    try{
      baseChooseShowForPreset(pendingPreset);
    }finally{
      window.prompt=realPrompt;
    }

    pendingPreset=null;
    if(d?.open)d.close();
  }

  chooseShowForPreset=function(preset){
    openShowDropdown(preset);
  };

  ensureDialog();
  setTimeout(()=>{
    const version=document.getElementById('versionText');
    if(version)version.textContent='Prototype 1.7.1';
  },150);

  // Load the RTA display-speed upgrade after this compatibility layer.
  if(!document.querySelector('script[data-foh-v10]')){
    const s=document.createElement('script');
    s.src='upgrade-v10-rta-speed.js';
    s.dataset.fohV10='1';
    document.head.appendChild(s);
  }
})();
