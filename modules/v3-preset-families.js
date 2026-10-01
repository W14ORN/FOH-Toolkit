/* FOH Toolkit 3.1.2 — practical source-family filtering for official presets */
(function(){
  'use strict';

  if(typeof presets==='undefined')return;

  const families=[
    {key:'drums',label:'Drums & Percussion'},
    {key:'bass',label:'Bass'},
    {key:'electric-guitar',label:'Electric Guitars'},
    {key:'acoustic',label:'Acoustic / Folk Instruments'},
    {key:'keys',label:'Keys / Piano / Synths'},
    {key:'vocals',label:'Vocals'},
    {key:'choir',label:'Choir'},
    {key:'speech',label:'Speech / Broadcast'},
    {key:'brass',label:'Brass'},
    {key:'woodwind',label:'Woodwind'},
    {key:'strings',label:'Strings / Orchestra'},
    {key:'playback',label:'Playback / DI / DJ'},
    {key:'other',label:'Other / Specialist'}
  ];

  function sourceFamilyForPreset(p){
    const category=String(p?.category||'').toLowerCase();
    const name=String(p?.name||'').toLowerCase();
    const text=`${category} ${name}`;

    // Put orchestral sections before generic words such as "bass" or "instrument".
    if(/\b(trumpet|trombone|cornet|flugelhorn|euphonium|french horn|brass|tuba)\b/.test(text))return 'brass';
    if(/\b(sax|saxophone|flute|clarinet|oboe|bassoon|woodwind|piccolo)\b/.test(text))return 'woodwind';
    if(/\b(violin|viola|cello|double bass|strings?|string section|harp)\b/.test(text)||category==='strings')return 'strings';

    if(/\b(kick|snare|tom|overhead|drums?|cymbal|hi-hat|hihat|ride|subkick|percussion|timpani|marimba|xylophone|glockenspiel|triangle|cajon|conga|djembe|tambourine|shaker)\b/.test(text))return 'drums';
    if(category==='bass'||/\b(bass di|bass amp|upright bass|synth bass|bass guitar)\b/.test(text))return 'bass';

    if(/electric guitar|guitar — clean|guitar — crunch|guitar — high gain|guitar — ambient|rhythm guitar|lead guitar/.test(text))return 'electric-guitar';
    if(/acoustic guitar|nylon|string guitar|mandolin|banjo|ukulele|dobro|resonator/.test(text))return 'acoustic';

    // Synth bass has already been caught by Bass above.
    if(/\b(keys?|keyboard|piano|rhodes|organ|hammond|synth|leslie)\b/.test(text))return 'keys';

    if(/\bchoir\b/.test(text))return 'choir';
    if(category.includes('theatre vocal')||/\b(lead vocal|backing vocal|actor vocal|group vocal|vocal|vox|singer)\b/.test(text))return 'vocals';
    if(/\b(speech|presenter|lectern|commentator|broadcast|podcast|remote call|video conference|panel lav|headset mic|lav mic|pastor)\b/.test(text))return 'speech';

    if(/\b(playback|laptop|tracks?|stems?|dj|click|media|usb return|di box|stereo di)\b/.test(text)||category==='playback'||category==='di')return 'playback';

    if(/\b(acoustic instrument|accordion|harmonica)\b/.test(text))return 'acoustic';
    return 'other';
  }

  function familyLabel(key){return families.find(f=>f.key===key)?.label||'Other / Specialist';}

  function rebuildFilter(){
    const select=document.getElementById('categoryFilter');if(!select)return;
    const current=select.value;
    const counts=new Map(families.map(f=>[f.key,0]));
    presets.forEach(p=>counts.set(sourceFamilyForPreset(p),(counts.get(sourceFamilyForPreset(p))||0)+1));
    const options=families.filter(f=>(counts.get(f.key)||0)>0).map(f=>`<option value="family:${f.key}">${esc(f.label)} (${counts.get(f.key)})</option>`).join('');
    select.innerHTML=`<option value="all">All inputs (${presets.length})</option>${options}`;
    if([...select.options].some(o=>o.value===current))select.value=current;else select.value='all';
  }

  function familyMatches(p,value){
    if(value==='all')return true;
    if(value.startsWith('family:'))return sourceFamilyForPreset(p)===value.slice(7);
    // Compatibility with an old category value that may still exist during an upgrade frame.
    return p.category===value;
  }

  function renderFamilyPresets(){
    const search=document.getElementById('presetSearch');
    const select=document.getElementById('categoryFilter');
    const grid=document.getElementById('presetGrid');
    const count=document.getElementById('presetCount');
    if(!search||!select||!grid||!count)return;

    const q=search.value.trim().toLowerCase();
    const selected=select.value||'all';
    const list=presets.filter(p=>familyMatches(p,selected)&&(!q||`${p.name} ${p.category} ${p.style} ${p.description} ${familyLabel(sourceFamilyForPreset(p))}`.toLowerCase().includes(q)));

    count.textContent=`${list.length} preset${list.length===1?'':'s'}`;
    grid.innerHTML=list.map(p=>{
      const g=typeof groupForPreset==='function'?groupForPreset(p):{name:p.category||'Other',color:'#a7b2bc',soft:'rgba(167,178,188,.13)'};
      return `<article class="preset-card grouped-card" data-preset="${esc(p.id)}" style="--group:${g.color};--group-soft:${g.soft}"><span class="verified">VERIFIED</span><div class="group-ribbon">${esc(g.name)}</div><div class="category-icon">${esc(p.icon)}</div><h4>${esc(p.name)}</h4><p>${esc(p.style)}</p></article>`;
    }).join('')||'<div class="empty-state" style="grid-column:1/-1">No matching presets.</div>';

    grid.querySelectorAll('[data-preset]').forEach(card=>card.addEventListener('click',()=>openPreset(card.dataset.preset)));
  }

  window.sourceFamilyForPreset=sourceFamilyForPreset;
  window.FOHPresetFamilies={families,sourceFamilyForPreset,rebuildFilter};
  renderPresets=renderFamilyPresets;

  rebuildFilter();
  renderFamilyPresets();

  // Existing versions already registered listeners using the previous render function.
  // These run afterwards so the source-family result is always the final render.
  document.getElementById('categoryFilter')?.addEventListener('change',renderFamilyPresets);
  document.getElementById('presetSearch')?.addEventListener('input',renderFamilyPresets);
})();
