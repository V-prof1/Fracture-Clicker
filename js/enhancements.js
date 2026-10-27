import {developerReady} from './security.js';

const SAVE_KEY='fracture-clicker-save-v1';
const EXTRA_AUDIO_KEY='fracture-extra-audio-v4';
const $=s=>document.querySelector(s);

function gameState(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch{return{}}
}
function extraSettings(){
  try{return{music:true,musicVolume:.24,...JSON.parse(localStorage.getItem(EXTRA_AUDIO_KEY)||'{}')}}catch{return{music:true,musicVolume:.24}}
}
function saveExtra(v){localStorage.setItem(EXTRA_AUDIO_KEY,JSON.stringify(v))}

/* ---------- vendored CC0 background music playlist ---------- */
const MUSIC_TRACKS=[
  {title:'Feel Good Island Loop',url:'./assets/music/feel-good-island.ogg'},
  {title:'Cheesy Loop 1',url:'./assets/music/cheesy-loop-1.ogg'},
  {title:'Short Plingy Loop',url:'./assets/music/short-plingy-loop.ogg'},
  {title:'Backfoot',url:'./assets/music/backfoot.ogg'}
];
let music=null,musicStarted=false,musicOrder=[],musicPos=0,musicFailed=0;
function shuffledOrder(){
  const a=MUSIC_TRACKS.map((_,i)=>i);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function currentTrack(){
  if(!musicOrder.length)musicOrder=shuffledOrder();
  return MUSIC_TRACKS[musicOrder[musicPos%musicOrder.length]];
}
function updateNowPlaying(message=''){
  const el=$('#musicNowPlaying');if(!el)return;
  if(message){el.textContent=message;return}
  el.textContent=musicStarted?`Tocando: ${currentTrack().title}`:'Música pronta';
}
function ensureMusic(){
  if(music)return music;
  music=new Audio();
  music.preload='auto';
  music.playsInline=true;
  music.addEventListener('ended',()=>nextTrack());
  music.addEventListener('error',()=>{
    musicStarted=false;musicFailed++;
    if(musicFailed<MUSIC_TRACKS.length){updateNowPlaying('Falha nessa faixa · tentando outra…');setTimeout(()=>nextTrack(),120)}
    else updateNowPlaying('Não foi possível tocar áudio neste navegador.');
  });
  music.addEventListener('playing',()=>{musicStarted=true;musicFailed=0;updateNowPlaying()});
  music.addEventListener('pause',()=>{if(!document.hidden&&!music.ended){musicStarted=false;updateNowPlaying()}});
  return music;
}
function loadCurrentTrack(){
  const a=ensureMusic(),track=currentTrack();
  if(!a.src||!decodeURIComponent(a.src).endsWith(track.url.replace('./',''))){
    a.src=track.url;a.load();
  }
  a.volume=Math.max(0,Math.min(1,extraSettings().musicVolume));
  return a;
}
async function playCurrent(){
  const s=extraSettings();if(!s.music)return false;
  const a=loadCurrentTrack();
  try{await a.play();musicStarted=true;musicFailed=0;updateNowPlaying();return true}
  catch(err){musicStarted=false;updateNowPlaying('Toque em ▶ TOCAR MÚSICA');return false}
}
function nextTrack(){
  musicPos++;
  if(musicPos>=musicOrder.length){musicOrder=shuffledOrder();musicPos=0}
  if(music){music.pause();music.removeAttribute('src');music.load()}
  playCurrent();
}
function startMusic(){return playCurrent()}
function stopMusic(){if(!music)return;music.pause();musicStarted=false;updateNowPlaying('Música pausada')}
function setMusicVolume(v){if(music)music.volume=Math.max(0,Math.min(1,v))}

/* ---------- click tactile layer ---------- */
let fxCtx=null;
function audioContext(){
  if(!fxCtx)fxCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(fxCtx.state==='suspended')fxCtx.resume();
  return fxCtx;
}
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
  wrap.innerHTML=`<label class="music-row"><span>🎵 Música ambiente</span><input id="musicToggle" type="checkbox" ${s.music?'checked':''}></label><label class="music-row"><span>Volume da música</span><input id="musicVolume" type="range" min="0" max="100" value="${Math.round(s.musicVolume*100)}"></label><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center"><small id="musicNowPlaying" style="display:block;color:#8fa0c7;font-size:9px">Música pronta</small><button id="musicPlayBtn" class="secondary-btn" type="button" style="padding:8px 10px">▶ TOCAR</button></div>`;
  audioSection.append(wrap);
  $('#musicToggle').addEventListener('change',e=>{const n=extraSettings();n.music=e.target.checked;saveExtra(n);if(n.music)startMusic();else stopMusic()});
  $('#musicVolume').addEventListener('input',e=>{const n=extraSettings();n.musicVolume=Number(e.target.value)/100;saveExtra(n);setMusicVolume(n.musicVolume)});
  $('#musicPlayBtn').addEventListener('click',async()=>{const n=extraSettings();if(!n.music){n.music=true;saveExtra(n);$('#musicToggle').checked=true}await playCurrent()});
  updateNowPlaying();
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
function nodeLevel(btn){const text=btn.querySelector('b')?.textContent||'';const m=text.match(/·\s*([\d,.]+)\//);return m?Number(m[1].replace(/,/g,'')):0}
function decorateTree(){
  const root=$('#fragmentTree');if(!root)return;
  const direct=[...root.children].filter(x=>x.classList.contains('tree-node'));if(!direct.length)return;
  const byName=new Map(direct.map(b=>[nodeName(b),b]));root.innerHTML='';root.classList.add('skill-tree');
  TREE_BRANCHES.forEach(branch=>{
    const col=document.createElement('section');col.className=`skill-branch branch-${branch.key}`;
    col.innerHTML=`<div class="skill-branch-head"><span>${branch.icon}</span><div><b>${branch.title}</b><small>${branch.sub}</small></div></div>`;
    branch.names.forEach((name,index)=>{const btn=byName.get(name);if(!btn)return;btn.dataset.branch=branch.key;btn.dataset.depth=String(index);if(index>0){const prev=byName.get(branch.names[index-1]);if(prev&&nodeLevel(prev)<1){btn.disabled=true;btn.classList.add('locked-by-path');btn.title=`Invista 1 nível em ${branch.names[index-1]} primeiro`}}col.append(btn)});
    root.append(col);
  });
}
function installTreeObserver(){
  const root=$('#fragmentTree');if(!root)return;
  const obs=new MutationObserver(()=>{if([...root.children].some(x=>x.classList.contains('tree-node')))queueMicrotask(decorateTree)});
  obs.observe(root,{childList:true});decorateTree();
  const heading=$('#tab-rebirth .section-head h2');if(heading&&heading.textContent.includes('Fragment'))heading.textContent='Fragment Skill Tree';
}
function installColorPass(){if(document.querySelector('link[data-fracture-color]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='color-pass.css?v=1';link.dataset.fractureColor='1';document.head.append(link)}

function boot(){
  installColorPass();installMusicControls();installDevGesture();installTactileLayer();installTreeObserver();
  const version=$('.version');if(version)version.textContent='Fracture Clicker · Beta 0.4.1';
  const unlock=()=>{if(extraSettings().music)startMusic()};
  window.addEventListener('pointerdown',unlock,{once:true,capture:true});window.addEventListener('keydown',unlock,{once:true,capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(extraSettings().music)startMusic()});
}
boot();
