import {developerReady} from './security.js';

const SAVE_KEY='fracture-clicker-save-v1';
const EXTRA_AUDIO_KEY='fracture-extra-audio-v2';
const $=s=>document.querySelector(s);

function gameState(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch{return{}}
}
function extraSettings(){
  try{return{music:true,musicVolume:.28,...JSON.parse(localStorage.getItem(EXTRA_AUDIO_KEY)||'{}')}}catch{return{music:true,musicVolume:.28}}
}
function saveExtra(v){localStorage.setItem(EXTRA_AUDIO_KEY,JSON.stringify(v))}

/* ---------- brighter calm soundtrack ---------- */
let ctx=null,musicBus=null,musicTimer=null,phrase=0;
function audioContext(){
  if(!ctx){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    musicBus=ctx.createGain();
    const comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-24;comp.knee.value=18;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.18;
    musicBus.gain.value=.0001;
    musicBus.connect(comp).connect(ctx.destination);
  }
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
}

/* All-major / add6 / add9 voicings on purpose: calm, warm and more optimistic. */
const SONG=[
  [261.63,329.63,392.00,493.88,587.33], // Cmaj9
  [349.23,440.00,523.25,659.25,783.99], // Fmaj9
  [392.00,493.88,587.33,659.25,783.99], // G6
  [329.63,392.00,523.25,659.25,783.99]  // C6/E
];
const ARP=[0,2,4,2,1,3,4,3];

function musicVoice(freq,start,duration,volume,type='sine',cutoff=2100){
  const c=audioContext(),o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
  o.type=type;o.frequency.value=freq;f.type='lowpass';f.frequency.value=cutoff;f.Q.value=.25;
  g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),start+.035);
  g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  o.connect(f).connect(g).connect(musicBus);o.start(start);o.stop(start+duration+.03);
}
function softPluck(freq,start,volume=.036){
  musicVoice(freq,start,.34,volume,'triangle',2800);
  musicVoice(freq*2,start+.008,.18,volume*.24,'sine',3600);
}
function schedulePhrase(){
  const s=extraSettings();
  if(!s.music||document.hidden)return;
  const c=audioContext(),start=c.currentTime+.04,chord=SONG[phrase++%SONG.length];
  musicBus.gain.cancelScheduledValues(start);
  musicBus.gain.setTargetAtTime(Math.max(.0001,s.musicVolume),start,.12);

  // Airy major pad.
  chord.slice(0,4).forEach((freq,i)=>{
    musicVoice(freq/2,start,3.45,.010+(i===0?.004:0),i===0?'sine':'triangle',1200);
  });

  // Friendly little music-box/arpeggio line.
  ARP.forEach((idx,i)=>{
    const octave=i===4||i===7?2:1;
    softPluck(chord[idx%chord.length]*octave,start+.18+i*.39,i%2===0?.042:.032);
  });

  // Tiny sparkle at the end of each phrase.
  musicVoice(chord[4]*2,start+2.95,.48,.018,'sine',4200);
}
function startMusic(){
  const s=extraSettings();if(!s.music)return;
  audioContext();
  if(musicTimer)return;
  schedulePhrase();musicTimer=setInterval(schedulePhrase,3340);
}
function stopMusic(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(musicBus&&ctx){const t=ctx.currentTime;musicBus.gain.cancelScheduledValues(t);musicBus.gain.setTargetAtTime(.0001,t,.1)}
}

/* ---------- extra tactile layer ---------- */
function transient(style='classic'){
  const gs=gameState(),vol=Math.max(0,Math.min(1,Number(gs?.settings?.clickVolume??.55)))*.045;
  if(vol<=0)return;
  const c=audioContext(),t=c.currentTime;
  const buffer=c.createBuffer(1,Math.floor(c.sampleRate*.014),c.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const e=1-i/data.length;data[i]=(Math.random()*2-1)*e*e}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buffer;
  f.type=style==='slime'||style==='heavy'?'lowpass':'highpass';
  f.frequency.value=style==='slime'?1000:style==='heavy'?850:style==='magnetic'?4400:3000;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.014);src.connect(f).connect(g).connect(c.destination);src.start(t);
  const o=c.createOscillator(),og=c.createGain();o.type=style==='mechanical'?'square':style==='magnetic'?'triangle':'sine';
  const pair=style==='slime'?[165,72]:style==='mechanical'?[230,120]:style==='magnetic'?[920,520]:style==='heavy'?[105,55]:[520,310];
  o.frequency.setValueAtTime(pair[0],t);o.frequency.exponentialRampToValueAtTime(pair[1],t+.028);
  og.gain.setValueAtTime(vol*.72,t);og.gain.exponentialRampToValueAtTime(.0001,t+.03);o.connect(og).connect(c.destination);o.start(t);o.stop(t+.032);
}

function installMusicControls(){
  const audioSection=[...document.querySelectorAll('.setting-section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Áudio');
  if(!audioSection||audioSection.querySelector('.music-controls'))return;
  const s=extraSettings(),wrap=document.createElement('div');wrap.className='music-controls';
  wrap.innerHTML=`<label class="music-row"><span>🎵 Música ambiente</span><input id="musicToggle" type="checkbox" ${s.music?'checked':''}></label><label class="music-row"><span>Volume da música</span><input id="musicVolume" type="range" min="0" max="100" value="${Math.round(s.musicVolume*100)}"></label>`;
  audioSection.append(wrap);
  $('#musicToggle').addEventListener('change',e=>{const n=extraSettings();n.music=e.target.checked;saveExtra(n);if(n.music)startMusic();else stopMusic()});
  $('#musicVolume').addEventListener('input',e=>{const n=extraSettings();n.musicVolume=Number(e.target.value)/100;saveExtra(n);if(n.music){if(musicBus&&ctx)musicBus.gain.setTargetAtTime(Math.max(.0001,n.musicVolume),ctx.currentTime,.08);startMusic()}});
}

/* ---------- hidden developer gesture ---------- */
function installDevGesture(){
  const brand=$('#brandHold');if(!brand)return;
  brand.addEventListener('pointerdown',e=>e.stopImmediatePropagation(),true);
  let taps=0,resetTimer=null;
  brand.addEventListener('click',()=>{
    const state=gameState();if(!developerReady(state)){taps=0;return}
    taps++;clearTimeout(resetTimer);resetTimer=setTimeout(()=>{taps=0},6000);
    if(taps<10)return;
    taps=0;clearTimeout(resetTimer);
    const modal=$('#devModal');if(!modal)return;
    const nick=$('#devNick');if(nick)nick.textContent=state?.settings?.nickname||'Developer';
    if(!modal.open)modal.showModal();
  });
}

function installTactileLayer(){
  const core=$('#coreBtn');if(core)core.addEventListener('pointerdown',()=>transient(gameState()?.settings?.clickStyle||'classic'));
  const test=$('#testSoundBtn');if(test)test.addEventListener('click',()=>transient($('#clickStyle')?.value||'classic'));
}

/* ---------- real visual Fragment Skill Tree ---------- */
const TREE_BRANCHES=[
  {key:'touch',icon:'✦',title:'TOUCH',sub:'Manual click & critical',names:['Fractured Touch','Critical Theory','Critical Force','Overcharge Core']},
  {key:'auto',icon:'⚙',title:'AUTOMATION',sub:'Idle & passive growth',names:['Automated Pulse','Deep Storage','Mission Yield']},
  {key:'rebirth',icon:'↻',title:'REBIRTH',sub:'Faster permanent growth',names:['Fragment Memory','Rebirth Echo','Rebirth Rush']},
  {key:'mutation',icon:'✧',title:'MUTATION',sub:'Luck & mutation power',names:['Mutation Luck','Unstable Matter']}
];
function nodeName(btn){return (btn.querySelector('b')?.textContent||'').split(' · ')[0].trim()}
function nodeLevel(btn){
  const text=btn.querySelector('b')?.textContent||'';const m=text.match(/·\s*([\d,.]+)\//);return m?Number(m[1].replace(/,/g,'')):0;
}
function decorateTree(){
  const root=$('#fragmentTree');if(!root)return;
  const direct=[...root.children].filter(x=>x.classList.contains('tree-node'));if(!direct.length)return;
  const byName=new Map(direct.map(b=>[nodeName(b),b]));root.innerHTML='';root.classList.add('skill-tree');
  TREE_BRANCHES.forEach(branch=>{
    const col=document.createElement('section');col.className=`skill-branch branch-${branch.key}`;
    col.innerHTML=`<div class="skill-branch-head"><span>${branch.icon}</span><div><b>${branch.title}</b><small>${branch.sub}</small></div></div>`;
    branch.names.forEach((name,index)=>{
      const btn=byName.get(name);if(!btn)return;
      btn.dataset.branch=branch.key;btn.dataset.depth=String(index);
      if(index>0){
        const prev=byName.get(branch.names[index-1]);
        if(prev&&nodeLevel(prev)<1){btn.disabled=true;btn.classList.add('locked-by-path');btn.title=`Invista 1 nível em ${branch.names[index-1]} primeiro`;}
      }
      col.append(btn);
    });
    root.append(col);
  });
}
function installTreeObserver(){
  const root=$('#fragmentTree');if(!root)return;
  const obs=new MutationObserver(()=>{if([...root.children].some(x=>x.classList.contains('tree-node')))queueMicrotask(decorateTree)});
  obs.observe(root,{childList:true});decorateTree();
  const heading=$('#tab-rebirth .section-head h2');if(heading&&heading.textContent.includes('Fragment'))heading.textContent='Fragment Skill Tree';
}

function installColorPass(){
  if(document.querySelector('link[data-fracture-color]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='color-pass.css?v=1';link.dataset.fractureColor='1';document.head.append(link);
}

function boot(){
  installColorPass();installMusicControls();installDevGesture();installTactileLayer();installTreeObserver();
  const version=$('.version');if(version)version.textContent='Fracture Clicker · Beta 0.3';
  const unlock=()=>{if(extraSettings().music)startMusic()};
  window.addEventListener('pointerdown',unlock,{once:true,capture:true});window.addEventListener('keydown',unlock,{once:true,capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(extraSettings().music)startMusic()});
}
boot();
