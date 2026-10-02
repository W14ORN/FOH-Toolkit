/* FOH Toolkit 3.1.4 — final preset-family integration */
(function(){
  'use strict';

  const FAMILY_ORDER=[
    ['drums','Drums & Percussion'],
    ['bass','Bass'],
    ['electric-guitar','Electric Guitars'],
    ['acoustic','Acoustic / Folk Instruments'],
    ['keys','Keys / Piano / Synths'],
    ['vocals','Vocals'],
    ['choir','Choir'],
    ['speech','Speech / Broadcast'],
    ['brass','Brass'],
    ['woodwind','Woodwind'],
    ['strings','Strings / Orchestra'],
    ['playback','Playback / DI / DJ'],
    ['other','Other / Specialist']
  ];

  function familyFor(p){
    if(typeof window.sourceFamilyForPreset==='function')return window.sourceFamilyForPreset(p);
    const text=`${p?.category||''} ${p?.name||''}`.toLowerCase();
    if(/kick|snare|tom|overhead|drum|cymbal|hi-hat|hihat|ride|subkick|percussion|timpani|marimba|xylophone|glockenspiel|triangle|cajon|conga|djembe|tambourine|shaker/.test(text))return 'drums';
    if(/bass di|bass amp|upright bass|synth bass|bass guitar/.test(text)||String(p?.category||'').toLowerCase()==='bass')return 'bass';
    if(/electric guitar|rhythm guitar|lead guitar/.test(text))return 'electric-guitar';
    if(/acoustic guitar|nylon|mandolin|banjo|ukulele|dobro|resonator|accordion|harmonica/.test(text))return 'acoustic';
    if(/keys|keyboard|piano|rhodes|organ|hammond|synth|leslie/.test(text))return 'keys';
    if(/choir/.test(text))return 'choir';
    if(/lead vocal|backing vocal|actor vocal|group vocal|vocal|vox|singer/.test(text))return 'vocals';
    if(/speech|presenter|lectern|commentator|broadcast|podcast|remote call|video conference|panel lav|headset mic|lav mic|pastor/.test(text))return 'speech';
    if(/trumpet|trombone|cornet|flugelhorn|euphonium|french horn|brass|tuba/.test(text))return 'brass';
    if(/sax|saxophone|flute|clarinet|oboe|bassoon|woodwind|piccolo/.test(text))return 'woodwind';
    if(/violin|viola|cello|double bass|strings?|string section|harp/.test(text))return 'strings';
    if(/playback|laptop|tracks?|stems?|dj|click|media|usb return|di box|stereo di/.test(text))return 'playback';
    return 'other';
  }

  function rebuildDropdown(){
    const select=document.getElementById('categoryFilter');
    if(!select||typeof presets==='undefined')return;
    const previous=select.value;
    const counts=new Map(FAMILY_ORDER.map(([key])=>[key,0]));
    presets.forEach(p=>{const key=familyFor(p);counts.set(key,(counts.get(key)||0)+1);});
    select.innerHTML=`<option value="all">All inputs (${presets.length})</option>`+FAMILY_ORDER
      .filter(([key])=>(counts.get(key)||0)>0)
      .map(([key,label])=>`<option value="family:${key}">${esc(label)} (${counts.get(key)})</option>`)
      .join('');
    select.value=[...select.options].some(o=>o.value===previous)?previous:'all';
  }

  const baseRender=window.renderPresets||renderPresets;
  function renderWithFamily(){
    const select=document.getElementById('categoryFilter');
    if(!select||typeof baseRender!=='function')return;
    const chosen=select.value||'all';

    if(!chosen.startsWith('family:')){
      baseRender();
      return;
    }

    // v3-core understands its original exact categories. Render its full current
    // result first (preserving favourites/pinned/recent/most-used/search), then
    // narrow that result to the selected practical input family.
    const wanted=chosen.slice(7);
    select.value='all';
    baseRender();
    select.value=chosen;

    const grid=document.getElementById('presetGrid');
    if(!grid)return;
    let shown=0;
    grid.querySelectorAll('[data-preset]').forEach(card=>{
      const p=presets.find(x=>String(x.id)===String(card.dataset.preset));
      if(!p||familyFor(p)!==wanted){card.remove();return;}
      shown++;
    });

    const count=document.getElementById('presetCount');
    if(count)count.textContent=`${shown} preset${shown===1?'':'s'}`;
    if(!shown)grid.innerHTML='<div class="empty-state" style="grid-column:1/-1">No matching presets.</div>';
  }

  window.renderPresets=renderPresets=renderWithFamily;
  window.sourceFamilyForPreset=familyFor;

  function ready(){
    rebuildDropdown();
    renderWithFamily();
    document.getElementById('categoryFilter')?.addEventListener('change',renderWithFamily);
    document.getElementById('presetSearch')?.addEventListener('input',renderWithFamily);
    document.querySelector('[data-nav="presets"]')?.addEventListener('click',()=>setTimeout(()=>{rebuildDropdown();renderWithFamily();},0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
