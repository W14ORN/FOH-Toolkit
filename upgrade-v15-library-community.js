/* FOH Toolkit Prototype 2.1 — expanded official library + Community discovery */
(function(){
  'use strict';

  const SUPABASE_URL='https://emwyytgxyrxhyoxwjamu.supabase.co';
  const SUPABASE_KEY='sb_publishable_N0iuwftuSSiMPIdsQ7dsiQ_aJe8qVzX';
  const APPROVED_CACHE='fohCommunityApprovedCache';
  const OFFLINE_USER_KEY='fohOfflineUser';
  const VERSION='Prototype 2.1.0';

  let communityClient=null;
  let communityRows=[];
  let ratingRows=[];
  let activeCommunityId=null;
  let cardObserver=null;
  let detailObserver=null;
  let decorating=false;

  const C=(threshold,ratio,attack,release,makeup=0)=>({threshold,ratio,attack,release,makeup});
  const G=(threshold,range,attack,hold,release)=>({threshold,range,attack,hold,release});
  const P=(id,name,category,style,icon,description,why,hpf,lpf,eq,gate=null,comp=null)=>({id,name,category,style,icon,description,why,hpf,lpf,eq,gate,comp});

  const extraPresets=[
    P('kick-pop','Kick — Pop','Kick','Pop / Modern','K','Tight low end with a polished attack that stays clear beneath dense pop production.','A controlled 65–75 Hz lift adds punch, a low-mid cut clears boxiness and a modest upper-mid boost defines the beater.',45,10500,[{f:70,g:4,q:1.2},{f:300,g:-4,q:1.5},{f:3000,g:2.5,q:1.4},{f:7500,g:1,q:1.2}],G(-32,24,4,35,120),C(-18,'3:1',12,90)),
    P('kick-metal','Kick — Metal','Kick','Metal / Heavy Rock','K','Fast, tight kick with strong beater definition and controlled low-mid bloom.','The low shelf area keeps weight while deeper low-mid reduction and a focused attack boost help rapid kick patterns remain distinct.',42,11500,[{f:62,g:4.5,q:1.2},{f:280,g:-5,q:1.5},{f:4200,g:4,q:1.5},{f:8000,g:1.5,q:1.3}],G(-28,30,2,25,80),C(-16,'4:1',8,65)),
    P('kick-jazz','Kick — Jazz','Kick','Jazz / Acoustic','K','Natural acoustic kick with body and minimal processing.','Gentle shaping keeps the shell sounding like a drum rather than a heavily processed rock kick.',35,14000,[{f:80,g:2,q:1.0},{f:350,g:-1.5,q:1.3},{f:2500,g:1,q:1.2}],null,C(-10,'2:1',30,180)),
    P('kick-acoustic','Kick — Acoustic / Folk','Kick','Folk / Acoustic','K','Warm kick for quieter stages and natural arrangements.','Moderate filtering and small moves preserve the source while controlling mud and adding just enough definition.',40,12000,[{f:75,g:2.5,q:1.1},{f:320,g:-2.5,q:1.4},{f:3000,g:1.5,q:1.3}],G(-38,14,5,45,160),C(-14,'2.5:1',22,140)),
    P('snare-pop','Snare — Pop','Snare','Pop / Modern','S','Bright, punchy snare with a controlled body and clean transient.','Body around 180–220 Hz is retained while boxiness is reduced and the stick attack gets a focused presence lift.',95,15000,[{f:200,g:2,q:1.2},{f:550,g:-3,q:1.5},{f:4800,g:3,q:1.3},{f:10000,g:1.5,q:1.0}],G(-35,18,3,55,160),C(-17,'3:1',16,100)),
    P('snare-metal','Snare — Metal','Snare','Metal / Heavy Rock','S','Aggressive crack with reduced ring and enough body to survive loud guitars.','A deeper low-mid cleanup plus stronger presence lift gives the drum definition without relying on excessive level.',90,14500,[{f:190,g:2.5,q:1.1},{f:650,g:-4.5,q:1.7},{f:5500,g:4,q:1.4},{f:9000,g:1,q:1.1}],G(-30,24,2,45,130),C(-15,'4:1',12,80)),
    P('snare-jazz-brush','Snare — Jazz / Brushes','Snare','Jazz / Brushes','S','Open snare with brush detail and very gentle dynamics.','Minimal gating and compression keep brush articulation and natural sustain intact.',110,17000,[{f:220,g:1.5,q:1.0},{f:700,g:-1.5,q:1.4},{f:6000,g:1.5,q:1.1},{f:11000,g:1,q:.9}],null,C(-8,'2:1',35,220)),
    P('snare-bottom','Snare Bottom','Snare','Live / Rock / Pop','SB','Adds wire detail and snap beneath a top snare microphone.','A high HPF removes unnecessary shell weight while an upper-mid lift emphasises the snare wires. Check polarity against the top mic.',180,16000,[{f:800,g:-2,q:1.3},{f:4500,g:2.5,q:1.3},{f:9000,g:2,q:1.0}],G(-40,14,2,45,140),C(-12,'2:1',20,110)),
    P('hi-hat','Hi-Hat','Cymbals','Rock / Pop','HH','Clean hat detail without dragging snare and low-mid spill into the mix.','Strong high-pass filtering leaves the low end to the rest of the kit, while a mild harshness cut keeps the hat listenable.',300,18000,[{f:900,g:-2,q:1.3},{f:4500,g:-1.5,q:1.7},{f:10000,g:1.5,q:1.0}],null,C(-8,'2:1',35,160)),
    P('ride-cymbal','Ride Cymbal','Cymbals','Rock / Jazz','R','Clear stick definition with controlled wash.','Filtering removes stage rumble and a gentle upper-mid focus makes the stick audible without turning the bell brittle.',250,18000,[{f:700,g:-1.5,q:1.2},{f:3500,g:1.5,q:1.3},{f:7500,g:-1,q:1.6},{f:12000,g:1,q:.9}],null,C(-8,'2:1',35,180)),
    P('overhead-mono','Overhead — Mono','Overhead','Live / Small Stage','OH','Single-mic kit picture for compact stages and smaller systems.','A slightly lower HPF than close cymbal mics lets the overhead contribute some kit body while low-mid cleanup reduces cloudiness.',140,18000,[{f:300,g:-2,q:1.2},{f:2500,g:-1.5,q:1.5},{f:9500,g:1.5,q:1.0}],null,C(-10,'2:1',30,180)),
    P('drum-room','Drum Room Mic','Drums','Rock / Live','RM','Adds size and ambience to a close-mic drum mix.','Low-mid trimming stops the room channel becoming muddy, while slower compression can make the room feel larger.',90,15000,[{f:180,g:-2,q:1.2},{f:500,g:-2.5,q:1.4},{f:3500,g:1.5,q:1.2}],null,C(-18,'4:1',30,240)),
    P('subkick','Subkick','Kick','Rock / Electronic','SK','Dedicated sub weight for a kick without unnecessary midrange.','A narrow useful bandwidth leaves the subkick doing one job: reinforcing the fundamental while staying out of the rest of the kit.',25,180,[{f:55,g:3,q:1.1},{f:110,g:-1.5,q:1.3}],null,C(-16,'3:1',25,150)),
    P('cajon','Cajon','Percussion','Acoustic / Folk','CJ','Balanced cajon with low thump and front-slap definition.','A low boost supports the bass port while low-mid cleanup and a presence lift keep hand articulation clear.',55,14000,[{f:90,g:3,q:1.2},{f:350,g:-3,q:1.5},{f:3000,g:2,q:1.3}],G(-42,10,5,50,180),C(-16,'3:1',18,130)),
    P('conga','Conga','Percussion','Latin / Pop','CG','Full conga tone with controlled boxiness and clear hand attack.','The low-mid cut prevents congestion while a modest attack lift keeps slaps readable.',75,15000,[{f:160,g:2,q:1.2},{f:450,g:-3,q:1.5},{f:3500,g:2,q:1.3}],null,C(-14,'3:1',20,120)),
    P('djembe','Djembe','Percussion','World / Acoustic','DJ','Deep body with crisp hand articulation.','A controlled low boost and low-mid reduction balance the bass tone against the brighter slap.',55,15000,[{f:90,g:2.5,q:1.2},{f:380,g:-2.5,q:1.5},{f:4000,g:2,q:1.3}],null,C(-15,'3:1',18,130)),
    P('tambourine','Tambourine','Percussion','Pop / Rock','TB','Bright tambourine that cuts through without excessive low-mid spill.','Aggressive HPF keeps only the useful jingle content, with a small harshness cut if needed.',400,18000,[{f:2500,g:-1.5,q:1.5},{f:7000,g:1.5,q:1.0},{f:12000,g:1,q:.9}],null,C(-8,'2:1',20,100)),
    P('shaker','Shaker','Percussion','Pop / Acoustic','SH','Light shaker texture with a clean, airy top end.','Strong filtering prevents the channel from carrying unnecessary stage noise while a small presence cut can tame scratchiness.',500,18000,[{f:3500,g:-1.5,q:1.5},{f:9000,g:1.5,q:1.0}],null,C(-6,'2:1',25,120)),

    P('bass-amp-mic','Bass Amp — Mic','Bass','Rock / Indie','B','Bass cabinet microphone with warmth and midrange character.','Subsonic filtering protects headroom, a low-mid cut controls cabinet wool and a presence lift restores note shape.',42,7000,[{f:90,g:2,q:1.1},{f:300,g:-3,q:1.4},{f:900,g:2,q:1.2},{f:2500,g:1,q:1.3}],null,C(-18,'4:1',30,130)),
    P('upright-bass','Upright Bass','Bass','Jazz / Acoustic','UB','Natural upright bass with body, wood and controlled boom.','A low HPF reduces stage rumble while gentle low-mid shaping keeps the instrument full but intelligible.',45,10000,[{f:90,g:2,q:1.0},{f:250,g:-2,q:1.3},{f:700,g:1.5,q:1.2},{f:2500,g:1,q:1.2}],null,C(-16,'3:1',35,180)),
    P('synth-bass','Synth Bass','Bass','Electronic / Pop','SB','Deep electronic bass with controlled sub energy and clear note definition.','Filtering below the useful fundamental protects headroom while light compression keeps programmed levels consistent.',30,9000,[{f:55,g:2,q:1.0},{f:180,g:-1.5,q:1.3},{f:850,g:1.5,q:1.2}],null,C(-20,'4:1',20,120)),

    P('electric-clean','Electric Guitar — Clean','Electric Guitar','Pop / Indie / Funk','G','Clean guitar with sparkle and enough body without taking over the vocal range.','Low filtering keeps it out of the bass, while small mid shaping leaves room for vocals and keeps pick detail audible.',95,12500,[{f:220,g:-1.5,q:1.2},{f:450,g:-1.5,q:1.4},{f:2200,g:1.5,q:1.2},{f:6500,g:1,q:1.2}],null,C(-8,'2:1',25,120)),
    P('electric-crunch','Electric Guitar — Crunch','Electric Guitar','Rock / Indie','G','Mid-forward crunch tone that stays solid without becoming harsh.','A tighter low end and modest upper-mid control make room for bass and vocals while preserving guitar energy.',90,10500,[{f:180,g:-1.5,q:1.1},{f:350,g:-2.5,q:1.4},{f:1600,g:1.5,q:1.2},{f:4000,g:-1.5,q:1.5}],null,C(-10,'2:1',25,110)),
    P('electric-high-gain','Electric Guitar — High Gain','Electric Guitar','Metal / Heavy Rock','G','Dense high-gain rhythm guitar with reduced fizz and low-mid buildup.','Strong filtering and low-mid cleanup make space for kick and bass, while a controlled top end reduces modeller or cabinet fizz.',100,9000,[{f:220,g:-2,q:1.2},{f:400,g:-3,q:1.5},{f:1800,g:1.5,q:1.3},{f:4500,g:-2,q:1.6}],null,C(-8,'2:1',30,110)),
    P('electric-ambient','Electric Guitar — Ambient','Electric Guitar','Indie / Worship / Ambient','G','Wide clean/edge-of-breakup guitar that leaves room for long delays and reverbs.','A higher HPF and gentle mid cleanup stop ambience from washing over the low mids while retaining clarity.',110,12000,[{f:250,g:-2,q:1.2},{f:600,g:-1.5,q:1.4},{f:2500,g:1.5,q:1.2},{f:6500,g:-1,q:1.5}],null,C(-8,'2:1',30,150)),

    P('acoustic-strum','Acoustic Guitar — Strumming','Acoustic Guitar','Pop / Acoustic','A','Tight strummed acoustic that supports the rhythm without booming.','A stronger HPF and low-mid cut control body resonance while a small presence lift keeps the pick pattern clear.',100,14500,[{f:180,g:-2,q:1.3},{f:320,g:-3,q:1.4},{f:2200,g:1.5,q:1.4},{f:8000,g:1,q:1.0}],null,C(-16,'3:1',20,130)),
    P('acoustic-fingerstyle','Acoustic Guitar — Fingerstyle','Acoustic Guitar','Acoustic / Folk','A','Natural fingerstyle acoustic with body and string detail.','Gentler filtering preserves warmth, while restrained upper-mid shaping keeps finger noise under control.',75,16000,[{f:160,g:1,q:1.1},{f:350,g:-1.5,q:1.3},{f:2600,g:-1,q:1.5},{f:9000,g:1.5,q:1.0}],null,C(-18,'2.5:1',28,160)),
    P('nylon-guitar','Nylon String Guitar','Acoustic Guitar','Classical / Latin','NG','Warm nylon guitar with natural body and soft articulation.','Minimal processing keeps the instrument organic while reducing boxiness and gently opening the upper mids.',80,15000,[{f:180,g:1,q:1.1},{f:400,g:-2,q:1.4},{f:2500,g:1,q:1.3},{f:8000,g:1,q:1.0}],null,C(-14,'2:1',35,180)),
    P('mandolin','Mandolin','Acoustic Instrument','Folk / Country','M','Bright mandolin that stays present without becoming brittle.','A high HPF removes unnecessary lows and a controlled presence region balances pick definition against harshness.',140,16000,[{f:350,g:-2,q:1.4},{f:2500,g:1.5,q:1.3},{f:5000,g:-1.5,q:1.6},{f:10000,g:1,q:1.0}],null,C(-12,'2.5:1',20,120)),
    P('banjo','Banjo','Acoustic Instrument','Folk / Country','BJ','Focused banjo with strong articulation and reduced honk.','Filtering clears stage rumble, a mid cut reduces nasal tone and upper-mid control prevents excessive bite.',120,15000,[{f:450,g:-2,q:1.4},{f:1200,g:-2,q:1.5},{f:3200,g:1.5,q:1.3},{f:6500,g:-1,q:1.5}],null,C(-12,'2.5:1',20,120)),

    P('grand-piano','Grand Piano','Keys','Pop / Jazz / Live','P','Balanced piano with body, clarity and controlled low-mid density.','A gentle low cut avoids stage rumble, while broad shaping opens the midrange without making the instrument thin.',45,18000,[{f:100,g:1.5,q:1.0},{f:280,g:-2,q:1.2},{f:2500,g:1.5,q:1.1},{f:9000,g:1,q:.9}],null,C(-14,'2:1',35,180)),
    P('electric-piano','Electric Piano / Rhodes','Keys','Soul / Pop / Jazz','EP','Warm electric piano with a smooth midrange and enough attack to stay present.','Low-mid cleanup prevents woolliness while a gentle presence lift helps chord definition.',60,15000,[{f:120,g:1,q:1.0},{f:350,g:-2,q:1.3},{f:1800,g:1.5,q:1.2},{f:6500,g:1,q:1.0}],null,C(-16,'2.5:1',30,160)),
    P('hammond-organ','Hammond / Organ','Keys','Rock / Soul','ORG','Full organ with controlled low-mid buildup and clear upper harmonics.','A modest HPF leaves deep sub to the bass while broad low-mid cleanup prevents dense chords masking guitars and vocals.',70,14000,[{f:160,g:1,q:1.0},{f:400,g:-2.5,q:1.3},{f:1800,g:1.5,q:1.2},{f:5500,g:1,q:1.1}],null,C(-12,'2:1',30,150)),
    P('synth-pad','Synth Pad','Keys','Pop / Electronic / Ambient','PAD','Wide pad that fills space without swamping the low mids.','High-pass filtering and broad low-mid cuts leave room for bass, kick and vocals while retaining texture.',120,16000,[{f:250,g:-2,q:1.1},{f:500,g:-2,q:1.2},{f:2500,g:1,q:1.2},{f:9000,g:1,q:1.0}],null,C(-10,'2:1',40,220)),
    P('synth-lead','Synth Lead','Keys','Pop / Electronic','SY','Focused synth lead that cuts through without excessive harshness.','Low filtering clears headroom while presence shaping gives definition and a high-mid cut controls aggressive patches.',100,14000,[{f:250,g:-1.5,q:1.2},{f:1500,g:1.5,q:1.2},{f:3500,g:2,q:1.3},{f:6500,g:-1.5,q:1.5}],null,C(-16,'3:1',18,100)),
    P('keys-stereo','Keyboard — Stereo','Keys','General Live','KY','Neutral stereo keyboard starting point for workstation and stage-piano outputs.','Minimal shaping keeps programmed patches intact while protecting headroom from subsonic content and excessive low mids.',45,18000,[{f:250,g:-1.5,q:1.2},{f:2500,g:1,q:1.2},{f:9000,g:1,q:1.0}],null,C(-12,'2:1',30,160)),

    P('lead-vocal-male-pop','Lead Vocal — Male Pop','Lead Vocal','Pop / Modern','V','Polished male vocal with controlled low mids and an open presence region.','A sensible HPF clears stage noise, low-mid cuts improve intelligibility and gentle top-end lift adds air.',105,17000,[{f:220,g:-2.5,q:1.3},{f:500,g:-1.5,q:1.4},{f:3200,g:2,q:1.2},{f:10000,g:1.5,q:1.0}],G(-46,8,8,80,240),C(-20,'3:1',15,90)),
    P('lead-vocal-female-pop','Lead Vocal — Female Pop','Lead Vocal','Pop / Modern','V','Clear female pop vocal with presence and controlled sibilant energy.','Low-mid cleanup creates space while a broad presence lift helps the vocal sit forward without relying only on level.',120,17500,[{f:280,g:-2,q:1.3},{f:700,g:-1.5,q:1.4},{f:3800,g:2,q:1.2},{f:9500,g:1,q:1.0}],G(-47,8,8,80,240),C(-20,'3:1',14,85)),
    P('lead-vocal-rock-aggressive','Lead Vocal — Aggressive Rock','Lead Vocal','Rock / Punk / Metal','V','Dense vocal that stays intelligible against loud guitars and drums.','Stronger low-mid cleanup and controlled presence help the vocal cut without simply pushing the fader harder.',110,15500,[{f:250,g:-3,q:1.3},{f:650,g:-2,q:1.5},{f:2800,g:2.5,q:1.2},{f:6000,g:-1.5,q:1.6}],G(-42,12,5,70,200),C(-20,'4:1',10,80)),
    P('backing-vocal-male','Backing Vocal — Male','Backing Vocal','Rock / Pop','BV','Supportive male backing vocal that sits behind the lead.','Higher filtering and less presence than a lead vocal keep the backing part tidy while preserving intelligibility.',125,15000,[{f:260,g:-2.5,q:1.3},{f:650,g:-1.5,q:1.4},{f:2500,g:1.5,q:1.3},{f:8000,g:1,q:1.0}],G(-44,11,8,80,220),C(-18,'3:1',15,100)),
    P('backing-vocal-female','Backing Vocal — Female','Backing Vocal','Rock / Pop','BV','Open female backing vocal designed to blend rather than dominate.','The balance favours cleanliness and blend, with slightly restrained presence compared with a lead vocal.',135,16000,[{f:300,g:-2,q:1.3},{f:750,g:-1.5,q:1.4},{f:3000,g:1.5,q:1.3},{f:9000,g:1,q:1.0}],G(-45,10,8,80,220),C(-18,'3:1',14,95)),
    P('group-vocals','Group Vocals / Gang Vocals','Backing Vocal','Rock / Pop','GV','Multiple singers on one or several microphones with controlled low-mid buildup.','A higher HPF and broad low-mid reduction keep several voices from becoming thick and indistinct.',150,15000,[{f:300,g:-2.5,q:1.2},{f:700,g:-2,q:1.4},{f:2500,g:1.5,q:1.2},{f:8000,g:1,q:1.0}],null,C(-16,'3:1',18,120)),
    P('choir','Choir / Vocal Ensemble','Choir','Choir / Theatre','CH','Natural ensemble vocal sound with controlled room and low-frequency spill.','High-pass filtering clears stage noise while broad, gentle EQ avoids imposing a close-mic vocal sound on the ensemble.',140,17000,[{f:300,g:-1.5,q:1.1},{f:800,g:-1,q:1.2},{f:3000,g:1,q:1.1},{f:10000,g:1,q:.9}],null,C(-10,'2:1',35,220)),

    P('speech-handheld','Speech — Handheld','Speech','Corporate / Event','SP','Clear handheld speech with strong intelligibility and controlled proximity effect.','A firm HPF and low-mid cut improve clarity, while gentle presence helps speech carry without excessive brightness.',120,14500,[{f:220,g:-3,q:1.3},{f:650,g:-1.5,q:1.4},{f:2800,g:2.5,q:1.2},{f:7000,g:1,q:1.1}],G(-48,8,10,100,260),C(-22,'3:1',12,90)),
    P('speech-headset','Speech — Headset / Lav','Speech','Corporate / Theatre','HS','Intelligible headset or lavalier speech with reduced chestiness and controlled presence.','Higher filtering and careful low-mid cleanup compensate for close placement while the presence lift improves consonants.',140,14000,[{f:250,g:-3,q:1.3},{f:700,g:-2,q:1.4},{f:3200,g:2.5,q:1.2},{f:7500,g:-1,q:1.5}],null,C(-24,'3:1',10,80)),
    P('speech-lectern','Speech — Lectern / Gooseneck','Speech','Conference / Corporate','LX','Focused lectern microphone for spoken word and presentations.','Strong filtering reduces handling and room energy, while a moderate presence lift improves intelligibility at distance.',150,13500,[{f:300,g:-3,q:1.4},{f:800,g:-1.5,q:1.4},{f:3000,g:2.5,q:1.2},{f:6500,g:-1,q:1.5}],null,C(-22,'2.5:1',15,100)),
    P('commentator','Commentator / Announcer','Speech','Sports / Outdoor PA','CM','Dense, consistent commentary voice for long-throw or outdoor PA.','A strong HPF, low-mid cleanup and presence lift keep speech intelligible across a large site while compression controls level variation.',130,13000,[{f:250,g:-3,q:1.3},{f:600,g:-2,q:1.4},{f:2700,g:3,q:1.2},{f:6000,g:-1,q:1.5}],G(-45,8,8,100,250),C(-24,'4:1',8,70)),

    P('trumpet','Trumpet','Brass','Jazz / Pop / Soul','TR','Bright trumpet with body and controlled edge.','A firm HPF clears unnecessary lows while a small high-mid cut can tame aggressive close-mic bite.',120,16000,[{f:250,g:1,q:1.1},{f:900,g:-1.5,q:1.3},{f:3000,g:1.5,q:1.2},{f:5500,g:-2,q:1.6}],null,C(-12,'2.5:1',25,130)),
    P('trombone','Trombone','Brass','Jazz / Pop / Soul','TB','Full trombone with warmth and enough articulation to speak in a section.','Lower filtering preserves body while low-mid control and a gentle presence lift prevent the instrument sounding woolly.',80,15000,[{f:160,g:1.5,q:1.1},{f:450,g:-2,q:1.4},{f:2200,g:1.5,q:1.2},{f:5000,g:-1,q:1.5}],null,C(-14,'2.5:1',28,140)),
    P('alto-sax','Alto Sax','Woodwind','Jazz / Pop / Soul','AS','Present alto sax with controlled honk and smooth top end.','A broad mid cut reduces nasal tone while a moderate presence boost helps the instrument project.',100,15000,[{f:220,g:1,q:1.1},{f:850,g:-2,q:1.4},{f:2600,g:2,q:1.2},{f:6500,g:-1,q:1.5}],null,C(-14,'2.5:1',30,150)),
    P('tenor-sax','Tenor Sax','Woodwind','Jazz / Pop / Soul','TS','Warm tenor sax with body and a clear, forward midrange.','A lower HPF preserves warmth while low-mid cleanup and gentle presence keep the horn articulate.',80,14500,[{f:160,g:1.5,q:1.1},{f:500,g:-2,q:1.4},{f:2200,g:1.5,q:1.2},{f:6000,g:-1,q:1.5}],null,C(-14,'2.5:1',30,150)),
    P('horn-section','Horn Section','Brass','Funk / Soul / Pop','HN','Balanced section preset for multiple brass microphones or a section bus starting point.','Broad shaping keeps the combined section energetic without letting the upper mids become tiring.',100,15000,[{f:250,g:-1.5,q:1.1},{f:800,g:-1.5,q:1.3},{f:2500,g:1.5,q:1.2},{f:5500,g:-1.5,q:1.5}],null,C(-12,'2:1',30,150)),
    P('flute','Flute','Woodwind','Classical / Folk / Pop','FL','Open flute with breath detail and controlled shrillness.','A high HPF clears handling and room rumble while a gentle upper-mid cut helps close microphones stay smooth.',160,17500,[{f:500,g:-1,q:1.3},{f:3000,g:1,q:1.2},{f:6000,g:-1.5,q:1.5},{f:11000,g:1,q:.9}],null,C(-10,'2:1',35,180)),
    P('clarinet','Clarinet','Woodwind','Classical / Jazz','CL','Natural clarinet with controlled nasal mids and a smooth top.','Gentle broad shaping keeps the instrument woody and clear without over-brightening it.',100,15500,[{f:250,g:1,q:1.1},{f:900,g:-1.5,q:1.4},{f:2500,g:1,q:1.2},{f:6500,g:-1,q:1.5}],null,C(-10,'2:1',35,180)),
    P('harmonica','Harmonica','Other Instrument','Blues / Rock','HM','Forward harmonica with reduced harshness and controlled low-mid honk.','A firm HPF and upper-mid restraint help an already bright source sit in the mix without becoming painful.',140,12000,[{f:400,g:-2,q:1.4},{f:1500,g:1.5,q:1.2},{f:3500,g:-2,q:1.6},{f:7000,g:-1,q:1.5}],null,C(-16,'3:1',18,100)),

    P('violin','Violin','Strings','Classical / Folk / Pop','VN','Natural violin with body and controlled bow harshness.','High-pass filtering removes stage rumble while a restrained high-mid cut keeps close-mic bow noise manageable.',140,17000,[{f:300,g:1,q:1.1},{f:800,g:-1,q:1.3},{f:3000,g:-1.5,q:1.5},{f:9000,g:1,q:1.0}],null,C(-10,'2:1',35,180)),
    P('viola','Viola','Strings','Classical / Folk','VA','Warm viola with midrange detail and controlled boxiness.','A lower HPF than violin preserves body while a broad low-mid cut reduces enclosed-sounding resonance.',110,16500,[{f:220,g:1,q:1.1},{f:500,g:-1.5,q:1.3},{f:2200,g:1,q:1.2},{f:7000,g:1,q:1.0}],null,C(-10,'2:1',35,180)),
    P('cello','Cello','Strings','Classical / Pop','VC','Full cello with clear bow definition and controlled low-mid buildup.','Low filtering preserves the instrument foundation, while a low-mid cut makes room for bass instruments and piano.',60,15000,[{f:110,g:1.5,q:1.1},{f:300,g:-2,q:1.3},{f:1800,g:1.5,q:1.2},{f:6000,g:1,q:1.1}],null,C(-12,'2.5:1',35,180)),
    P('string-section','String Section','Strings','Classical / Pop / Theatre','ST','Natural string ensemble with width and controlled low-mid density.','Broad, gentle shaping maintains the ensemble character while preventing the section masking vocals and keys.',80,17500,[{f:180,g:1,q:1.0},{f:400,g:-1.5,q:1.2},{f:2500,g:1,q:1.1},{f:9000,g:1,q:.9}],null,C(-10,'2:1',40,220)),

    P('accordion','Accordion','Other Instrument','Folk / Traditional','AC','Balanced accordion with reduced boxiness and controlled reed bite.','A low-mid cut opens the sound while a restrained presence region keeps the reeds from becoming aggressive.',100,14000,[{f:250,g:-1.5,q:1.2},{f:600,g:-2,q:1.4},{f:2200,g:1.5,q:1.2},{f:5000,g:-1.5,q:1.5}],null,C(-12,'2.5:1',25,140)),
    P('harp','Harp','Strings','Classical / Acoustic','HP','Open harp with low-string warmth and clear plucked detail.','Gentle filtering keeps the low strings useful while midrange cleanup and light top lift preserve clarity.',60,18000,[{f:120,g:1,q:1.0},{f:350,g:-1.5,q:1.2},{f:2500,g:1,q:1.1},{f:10000,g:1.5,q:.9}],null,C(-10,'2:1',40,220)),

    P('playback-stereo','Playback — Stereo','Playback','General / Walk-in / Tracks','PB','Neutral playback starting point for music, walk-in and interval content.','Very light filtering protects subsonic headroom without changing mastered material unnecessarily.',30,19500,[{f:250,g:-.5,q:1.0},{f:3000,g:.5,q:1.0}],null,C(-6,'1.5:1',40,200)),
    P('dj-stereo','DJ / Decks','Playback','DJ / Club / Event','DJ','Controlled DJ input with subsonic protection and conservative dynamics.','The source is already mastered, so the aim is headroom protection rather than aggressive tonal shaping.',28,19500,[{f:70,g:-.5,q:1.0},{f:300,g:-.5,q:1.0},{f:8000,g:.5,q:1.0}],null,C(-8,'1.5:1',30,180)),
    P('tracks-mono','Backing Tracks — Mono','Playback','Band / Theatre','TRK','Reliable mono tracks feed with controlled low end and minimal processing.','Mastered tracks normally need little EQ; filtering and gentle compression are primarily safeguards.',30,19000,[{f:250,g:-.5,q:1.0},{f:3500,g:.5,q:1.0}],null,C(-8,'1.5:1',35,180)),
    P('laptop-presentation','Laptop / Presentation Audio','Playback','Corporate / Conference','PC','Speech-and-video playback feed that remains intelligible on conference systems.','A light low cut reduces unnecessary rumble while a small presence lift helps dialogue without heavily altering music.',45,18000,[{f:200,g:-1,q:1.2},{f:2800,g:1,q:1.1}],null,C(-10,'2:1',25,140))
  ];

  function addExpandedPresets(){
    if(!Array.isArray(window.presets)&&typeof presets==='undefined')return;
    const library=typeof presets!=='undefined'?presets:window.presets;
    const ids=new Set(library.map(p=>p.id));
    extraPresets.forEach(p=>{if(!ids.has(p.id))library.push(p);});

    const select=document.getElementById('categoryFilter');
    if(select){
      const selected=select.value||'all';
      const cats=[...new Set(library.map(p=>p.category))].sort((a,b)=>a.localeCompare(b));
      select.innerHTML='<option value="all">All channels</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
      if([...select.options].some(o=>o.value===selected))select.value=selected;
    }
    if(typeof renderPresets==='function')renderPresets();
  }

  function parseJson(raw,fallback){try{return JSON.parse(raw);}catch(_e){return fallback;}}
  function user(){return parseJson(localStorage.getItem(OFFLINE_USER_KEY),null);}
  function favKey(){return `fohCommunityFavourites:${user()?.id||'device'}`;}
  function getFavs(){return new Set(parseJson(localStorage.getItem(favKey()),[])||[]);}
  function setFavs(set){localStorage.setItem(favKey(),JSON.stringify([...set]));}

  function ensureCss(){
    if(document.getElementById('fohV15Css'))return;
    const l=document.createElement('link');l.id='fohV15Css';l.rel='stylesheet';l.href='upgrade-v15.css';document.head.appendChild(l);
  }

  function getCommunityClient(){
    if(communityClient)return communityClient;
    if(!window.supabase?.createClient)return null;
    communityClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});
    return communityClient;
  }

  function approvedMap(){return new Map(communityRows.map(r=>[String(r.id),r]));}
  function ratingStats(id){
    const list=ratingRows.filter(r=>String(r.preset_id)===String(id));
    if(!list.length)return {avg:0,count:0,mine:0};
    const avg=list.reduce((s,r)=>s+Number(r.rating||0),0)/list.length;
    const uid=user()?.id;
    const mine=uid?Number(list.find(r=>r.user_id===uid)?.rating||0):0;
    return {avg,count:list.length,mine};
  }

  async function loadCommunityExtras(){
    if(!navigator.onLine){
      communityRows=parseJson(localStorage.getItem(APPROVED_CACHE),[])||[];
      refreshCommunityExtras();
      return;
    }
    const c=getCommunityClient();
    if(!c){setTimeout(loadCommunityExtras,350);return;}
    try{
      const [{data:presetsData,error:pe},{data:ratingsData,error:re}]=await Promise.all([
        c.from('community_presets').select('id,name,category,style,author_name,description,why,hpf,lpf,eq,gate,comp,settings_text,status').eq('status','approved').order('created_at',{ascending:false}),
        c.from('community_preset_ratings').select('preset_id,user_id,rating')
      ]);
      if(pe)throw pe;
      communityRows=presetsData||[];
      if(!re)ratingRows=ratingsData||[];
      refreshCommunityExtras();
    }catch(err){
      console.warn('Community extras refresh failed',err);
      communityRows=parseJson(localStorage.getItem(APPROVED_CACHE),[])||[];
      refreshCommunityExtras();
    }
  }

  function ensureCommunityToolbar(){
    const grid=document.getElementById('communityApproved');if(!grid)return;
    if(document.getElementById('communityDiscoveryTools'))return;
    const bar=document.createElement('div');bar.id='communityDiscoveryTools';bar.className='community-discovery-tools';
    bar.innerHTML=`<label class="search-box community-search"><span>⌕</span><input id="communitySearch" type="search" placeholder="Search Community presets…" autocomplete="off"></label>
      <select id="communityCategoryFilter" aria-label="Community category"><option value="all">All channels</option></select>
      <button type="button" class="secondary community-favourites-toggle" id="communityFavouritesOnly">♡ Favourites</button>`;
    grid.parentElement.insertBefore(bar,grid);
    bar.querySelector('#communitySearch').addEventListener('input',applyCommunityFilters);
    bar.querySelector('#communityCategoryFilter').addEventListener('change',applyCommunityFilters);
    bar.querySelector('#communityFavouritesOnly').addEventListener('click',e=>{
      const b=e.currentTarget;b.classList.toggle('active');b.textContent=b.classList.contains('active')?'♥ Favourites':'♡ Favourites';applyCommunityFilters();
    });
  }

  function updateCommunityCategories(){
    const select=document.getElementById('communityCategoryFilter');if(!select)return;
    const keep=select.value||'all';
    const cats=[...new Set(communityRows.map(r=>r.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    select.innerHTML='<option value="all">All channels</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    if([...select.options].some(o=>o.value===keep))select.value=keep;
  }

  function decorateCommunityCards(){
    if(decorating)return;decorating=true;
    try{
      const map=approvedMap(),favs=getFavs();
      document.querySelectorAll('#communityApproved [data-community-preset]').forEach(card=>{
        const id=String(card.dataset.communityPreset||'');
        const row=map.get(id);
        card.classList.toggle('community-favourite',favs.has(id));
        let fav=card.querySelector('.community-fav-btn');
        if(!fav){
          fav=document.createElement('button');fav.type='button';fav.className='community-fav-btn';fav.setAttribute('aria-label','Favourite Community preset');
          fav.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleFavourite(id);});
          card.appendChild(fav);
        }
        fav.textContent=favs.has(id)?'♥':'♡';
        let meta=card.querySelector('.community-rating-summary');
        if(!meta){meta=document.createElement('div');meta.className='community-rating-summary';card.appendChild(meta);}
        const rs=ratingStats(id);
        meta.textContent=rs.count?`★ ${rs.avg.toFixed(1)} · ${rs.count}`:'☆ No ratings yet';
        if(row){card.dataset.communityCategory=row.category||'';card.dataset.communitySearch=`${row.name||''} ${row.category||''} ${row.style||''} ${row.author_name||''}`.toLowerCase();}
      });
    }finally{decorating=false;}
    applyCommunityFilters();
  }

  function applyCommunityFilters(){
    const q=(document.getElementById('communitySearch')?.value||'').trim().toLowerCase();
    const cat=document.getElementById('communityCategoryFilter')?.value||'all';
    const favOnly=document.getElementById('communityFavouritesOnly')?.classList.contains('active');
    const favs=getFavs();
    document.querySelectorAll('#communityApproved [data-community-preset]').forEach(card=>{
      const id=String(card.dataset.communityPreset||'');
      const hay=card.dataset.communitySearch||card.textContent.toLowerCase();
      const cardCat=card.dataset.communityCategory||'';
      const show=(!q||hay.includes(q))&&(cat==='all'||cardCat===cat)&&(!favOnly||favs.has(id));
      card.hidden=!show;
    });
  }

  function toggleFavourite(id){
    const favs=getFavs();
    if(favs.has(id))favs.delete(id);else favs.add(id);
    setFavs(favs);decorateCommunityCards();
    if(activeCommunityId===id)decorateCommunityDetail();
    if(typeof toast==='function')toast(favs.has(id)?'Added to Community favourites':'Removed from favourites');
  }

  function genericCommunityPreset(row){
    return {
      id:`community-${row.id}`,name:row.name||'Community preset',category:row.category||'Other',style:row.style||'Community',icon:'C',
      description:row.description||'',why:row.why||'',hpf:row.hpf||null,lpf:row.lpf||null,eq:Array.isArray(row.eq)?row.eq:[],gate:row.gate||null,comp:row.comp||null
    };
  }

  function decorateCommunityDetail(){
    const detail=document.getElementById('presetDetail');
    if(!detail||!detail.querySelector('.community-separate-note')||!activeCommunityId)return;
    const id=String(activeCommunityId),row=approvedMap().get(id);if(!row)return;
    const note=detail.querySelector('.community-separate-note');
    let actions=detail.querySelector('#communityDetailExtras');
    if(!actions){
      actions=document.createElement('div');actions.id='communityDetailExtras';actions.className='community-detail-extras';
      note.parentElement.insertBefore(actions,note);
    }
    const favs=getFavs(),rs=ratingStats(id);
    actions.innerHTML=`<div class="community-detail-actions"><button type="button" class="secondary" id="communityDetailFav">${favs.has(id)?'♥ Favourite':'♡ Favourite'}</button><button type="button" class="primary" id="communityAddToShow">Add to a show</button></div>
      <div class="community-rating-box"><span class="eyebrow">COMMUNITY RATING</span><div class="community-stars" id="communityStars">${[1,2,3,4,5].map(n=>`<button type="button" data-rate="${n}" aria-label="Rate ${n} out of 5" class="${n<=rs.mine?'selected':''}">★</button>`).join('')}</div><p>${rs.count?`${rs.avg.toFixed(1)} / 5 from ${rs.count} rating${rs.count===1?'':'s'}`:'No ratings yet — be the first.'}</p></div>`;
    actions.querySelector('#communityDetailFav').addEventListener('click',()=>toggleFavourite(id));
    actions.querySelector('#communityAddToShow').addEventListener('click',()=>{
      if(typeof chooseShowForPreset==='function')chooseShowForPreset(genericCommunityPreset(row));
    });
    actions.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>rateCommunityPreset(id,Number(b.dataset.rate))));
  }

  async function rateCommunityPreset(id,rating){
    if(!navigator.onLine){if(typeof toast==='function')toast('Connect to the internet to rate a preset');return;}
    const c=getCommunityClient(),u=user();if(!c||!u?.id){if(typeof toast==='function')toast('Sign in to rate Community presets');return;}
    try{
      const payload={preset_id:id,user_id:u.id,rating,updated_at:new Date().toISOString()};
      const {error}=await c.from('community_preset_ratings').upsert(payload,{onConflict:'preset_id,user_id'});if(error)throw error;
      const existing=ratingRows.find(r=>String(r.preset_id)===String(id)&&r.user_id===u.id);
      if(existing)existing.rating=rating;else ratingRows.push({preset_id:id,user_id:u.id,rating});
      decorateCommunityCards();decorateCommunityDetail();
      if(typeof toast==='function')toast(`Rated ${rating}/5`);
    }catch(err){console.warn(err);if(typeof toast==='function')toast('Could not save rating');}
  }

  function refreshCommunityExtras(){
    ensureCommunityToolbar();updateCommunityCategories();decorateCommunityCards();decorateCommunityDetail();
  }

  function installCommunityObservers(){
    const grid=document.getElementById('communityApproved');
    if(grid&&!cardObserver){
      grid.addEventListener('click',e=>{
        const card=e.target.closest('[data-community-preset]');if(card)activeCommunityId=String(card.dataset.communityPreset||'');
      },true);
      let scheduled=false;
      cardObserver=new MutationObserver(()=>{
        if(scheduled)return;scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;decorateCommunityCards();});
      });
      cardObserver.observe(grid,{childList:true,subtree:false});
    }
    const detail=document.getElementById('presetDetail');
    if(detail&&!detailObserver){
      let scheduled=false;
      detailObserver=new MutationObserver(()=>{
        if(scheduled)return;scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;decorateCommunityDetail();});
      });
      detailObserver.observe(detail,{childList:true,subtree:true});
    }
  }

  function setVersion(){
    const v=document.getElementById('versionText');if(v)v.textContent=VERSION;
    const pv=document.querySelector('#fohProfileBody .profile-about .profile-stat-row strong');if(pv)pv.textContent=VERSION;
  }

  function ready(){
    ensureCss();addExpandedPresets();ensureCommunityToolbar();installCommunityObservers();setVersion();
    setTimeout(()=>{addExpandedPresets();refreshCommunityExtras();setVersion();},250);
    setTimeout(loadCommunityExtras,450);
    window.addEventListener('online',loadCommunityExtras);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
