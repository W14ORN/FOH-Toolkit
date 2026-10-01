/* FOH Toolkit 3.0 — expanded source colour grouping */
(function(){
  'use strict';
  const previous=window.groupKeyForPreset||groupKeyForPreset;
  window.groupKeyForPreset=groupKeyForPreset=function(p){
    const text=`${p?.category||''} ${p?.name||''}`.toLowerCase();
    if(/kick|snare|tom|overhead|drum|cymbal|hi-hat|hihat|percussion|timpani|marimba|xylophone|glockenspiel|triangle|cajon|conga|djembe|tambourine|shaker/.test(text))return 'drums';
    if(/bass|tuba/.test(text))return 'bass';
    if(/lead vocal|backing vocal|vocal|vox|speech|headset|lav|lectern|presenter|pastor|choir|commentator|broadcast|podcast|remote call/.test(text))return 'vox';
    if(/keys|keyboard|piano|synth|organ|rhodes|leslie/.test(text))return 'keys';
    if(/guitar|acoustic|brass|horn|sax|trumpet|trombone|woodwind|flute|clarinet|oboe|bassoon|violin|viola|cello|strings|mandolin|banjo|ukulele|dobro|harmonica|accordion|harp|instrument/.test(text))return 'instruments';
    if(/di|playback|laptop|tracks|stems|dj|click/.test(text))return 'di';
    return typeof previous==='function'?previous(p):'other';
  };
})();
