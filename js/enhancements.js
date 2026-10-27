import {developerReady} from './security.js';

const SAVE_KEY='fracture-clicker-save-v1';
const EXTRA_AUDIO_KEY='fracture-extra-audio-v1';
const $=s=>document.querySelector(s);

function gameState(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch{return{}}
}
function extraSettings(){
  try{return{music:true,musicVolume:.16,...JSON.parse(localStorage.getItem(EXTRA_AUDIO_KEY)||'{}')}}catch{return{music:true,musicVolume:.16}}
}
function saveExtra(v){localStorage.setItem(EXTRA_AUDIO_KEY,JSON.stringify(v))}

let ctx=null,musicGain=null,musicTimer=null,chordIndex=0;
function audioContext(){
  if(!ctx){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    musicGain=ctx.createGain();
    musicGain.gain.value=.0001;
    musicGain.connect(ctx.destination);
  }
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
}

const CHORDS=[
  [130.81,164.81,196.00,246.94],
  [110.00,130.81,164.81,220.00],
  [87.31,130.81,174.61,220.00],
  [98.00,146.83,196.00,246.94]
];

function scheduleChord(){
  const s=extraSettings();
  if(!s.music||document.hidden)return;
  const c=audioContext(),start=c.currentTime+.03,duration=4.4,notes=CHORDS[chordIndex++%CHORDS.length];
  musicGain.gain.cancelScheduledValues(start);
  musicGain.gain.setValueAtTime(.0001,start);
  musicGain.gain.exponentialRampToValueAtTime(Math.max(.0001,s.musicVolume*.105),start+.8);
  musicGain.gain.setValueAtTime(Math.max(.0001,s.musicVolume*.105),start+3.1);
  musicGain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  notes.forEach((freq,i)=>{
    const o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
    o.type=i===0?'sine':'triangle';
    o.frequency.value=freq*(i===3?2:1);
    o.detune.value=(i-1.5)*2.3;
    filter.type='lowpass';filter.frequency.value=1050;filter.Q.value=.25;
    g.gain.value=i===0?.42:.16;
    o.connect(filter).connect(g).connect(musicGain);
    o.start(start+i*.025);o.stop(start+duration+.05);
  });
  const bell=c.createOscillator(),bellGain=c.createGain();
  bell.type='sine';bell.frequency.value=notes[2]*4;
  bellGain.gain.setValueAtTime(.0001,start+.55);bellGain.gain.exponentialRampToValueAtTime(.018,start+.58);bellGain.gain.exponentialRampToValueAtTime(.0001,start+1.65);
  bell.connect(bellGain).connect(musicGain);bell.start(start+.55);bell.stop(start+1.7);
}
function startMusic(){
  const s=extraSettings();
  if(!s.music)return;
  audioContext();
  if(musicTimer)return;
  scheduleChord();
  musicTimer=setInterval(scheduleChord,4300);
}
function stopMusic(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(musicGain&&ctx){const t=ctx.currentTime;musicGain.gain.cancelScheduledValues(t);musicGain.gain.setTargetAtTime(.0001,t,.12)}
}

function transient(style='classic'){
  const gs=gameState(),vol=Math.max(0,Math.min(1,Number(gs?.settings?.clickVolume??.55)))*.045;
  if(vol<=0)return;
  const c=audioContext(),t=c.currentTime;
  const buffer=c.createBuffer(1,Math.floor(c.sampleRate*.014),c.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const e=1-i/data.length;data[i]=(Math.random()*2-1)*e*e}
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buffer;
  f.type=style==='slime'?'lowpass':style==='heavy'?'lowpass':'highpass';
  f.frequency.value=style==='slime'?1000:style==='heavy'?850:style==='magnetic'?4400:3000;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.014);src.connect(f).connect(g).connect(c.destination);src.start(t);
  const o=c.createOscillator(),og=c.createGain();
  o.type=style==='mechanical'?'square':style==='magnetic'?'triangle':'sine';
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
  $('#musicVolume').addEventListener('input',e=>{const n=extraSettings();n.musicVolume=Number(e.target.value)/100;saveExtra(n);if(n.music)startMusic()});
}

function installDevGesture(){
  const brand=$('#brandHold');if(!brand)return;
  // Prevent the old 10-second press from reaching the original target listener.
  brand.addEventListener('pointerdown',e=>e.stopImmediatePropagation(),true);
  let taps=0,resetTimer=null;
  brand.addEventListener('click',()=>{
    const state=gameState();
    if(!developerReady(state)){taps=0;return}
    taps++;
    clearTimeout(resetTimer);resetTimer=setTimeout(()=>{taps=0},6000);
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

function boot(){
  installMusicControls();installDevGesture();installTactileLayer();
  const version=$('.version');if(version)version.textContent='Fracture Clicker · Beta 0.2';
  const unlock=()=>{if(extraSettings().music)startMusic()};
  window.addEventListener('pointerdown',unlock,{once:true,capture:true});
  window.addEventListener('keydown',unlock,{once:true,capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(extraSettings().music)startMusic()});
}
boot();
