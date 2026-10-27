let ctx,master,compressor;

function ac(){
  if(!ctx){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();
    compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-18;
    compressor.knee.value=16;
    compressor.ratio.value=4;
    compressor.attack.value=.002;
    compressor.release.value=.08;
    master.gain.value=.78;
    master.connect(compressor).connect(ctx.destination);
  }
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
}

function tone({type='sine',from=420,to=420,duration=.04,volume=.08,delay=0,attack=.001,detune=0}){
  const c=ac(),t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
  o.type=type;
  o.frequency.setValueAtTime(Math.max(20,from),t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);
  o.detune.setValueAtTime(detune,t);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),t+attack);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g).connect(master);
  o.start(t);o.stop(t+duration+.01);
}

function noise({duration=.025,volume=.05,delay=0,filter='bandpass',freq=3000,q=.8}){
  const c=ac(),t=c.currentTime+delay,len=Math.max(1,Math.floor(c.sampleRate*duration));
  const buffer=c.createBuffer(1,len,c.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<len;i++){
    const env=1-i/len;
    data[i]=(Math.random()*2-1)*env*env;
  }
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=buffer;f.type=filter;f.frequency.value=freq;f.Q.value=q;
  g.gain.setValueAtTime(Math.max(.0001,volume),t);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  src.connect(f).connect(g).connect(master);src.start(t);
}

function pop(v,pitch=1,delay=0){
  tone({type:'sine',from:190*pitch,to:82*pitch,duration:.055,volume:v*.72,delay});
  noise({duration:.018,volume:v*.32,delay,filter:'lowpass',freq:1600*pitch});
}

export function playClick(style='classic',volume=.55,combo=0){
  const v=Math.max(0,Math.min(1,volume))*.2;
  if(v<=0)return;
  ac();
  const rnd=1+(Math.random()-.5)*.055;
  const comboLift=1+Math.min(.18,combo*.0018);
  const p=rnd*comboLift;

  switch(style){
    case 'soft':
      tone({type:'sine',from:360*p,to:245*p,duration:.038,volume:v*.55});
      noise({duration:.012,volume:v*.12,filter:'lowpass',freq:1800});
      break;

    case 'slime':
      pop(v*.95,p,.0);
      tone({type:'triangle',from:118*p,to:72*p,duration:.085,volume:v*.32,delay:.008});
      tone({type:'sine',from:255*p,to:175*p,duration:.035,volume:v*.2,delay:.014});
      break;

    case 'mechanical':
      noise({duration:.012,volume:v*.56,filter:'highpass',freq:2200,q:.5});
      tone({type:'square',from:175*p,to:128*p,duration:.024,volume:v*.25});
      tone({type:'triangle',from:620*p,to:410*p,duration:.016,volume:v*.22,delay:.006});
      noise({duration:.014,volume:v*.28,delay:.015,filter:'bandpass',freq:1450,q:2.5});
      break;

    case 'magnetic':
      noise({duration:.009,volume:v*.26,filter:'highpass',freq:3800,q:.7});
      tone({type:'triangle',from:760*p,to:510*p,duration:.021,volume:v*.46});
      tone({type:'sine',from:1120*p,to:820*p,duration:.018,volume:v*.25,delay:.004});
      tone({type:'triangle',from:470*p,to:350*p,duration:.018,volume:v*.28,delay:.013});
      noise({duration:.008,volume:v*.16,delay:.014,filter:'bandpass',freq:2600,q:3});
      break;

    case 'typewriter':
      noise({duration:.017,volume:v*.66,filter:'bandpass',freq:2800,q:1.4});
      tone({type:'square',from:145*p,to:96*p,duration:.022,volume:v*.25});
      tone({type:'triangle',from:900*p,to:560*p,duration:.012,volume:v*.18,delay:.009});
      break;

    case 'digital':
      tone({type:'square',from:760*p,to:640*p,duration:.014,volume:v*.28});
      tone({type:'sine',from:1250*p,to:920*p,duration:.022,volume:v*.3,delay:.004});
      noise({duration:.008,volume:v*.12,filter:'highpass',freq:5000});
      break;

    case 'crystal':
      tone({type:'sine',from:1280*p,to:980*p,duration:.055,volume:v*.38});
      tone({type:'sine',from:1910*p,to:1470*p,duration:.07,volume:v*.2,delay:.004});
      tone({type:'triangle',from:760*p,to:620*p,duration:.045,volume:v*.12,delay:.006});
      break;

    case 'heavy':
      tone({type:'sine',from:118*p,to:58*p,duration:.065,volume:v*.86});
      noise({duration:.021,volume:v*.34,filter:'lowpass',freq:950});
      tone({type:'triangle',from:260*p,to:130*p,duration:.035,volume:v*.2,delay:.006});
      break;

    case 'void':
      tone({type:'sine',from:168*p,to:74*p,duration:.09,volume:v*.64,detune:-120});
      tone({type:'triangle',from:310*p,to:205*p,duration:.1,volume:v*.26,delay:.008,detune:90});
      noise({duration:.035,volume:v*.15,filter:'bandpass',freq:720,q:4});
      break;

    default:
      noise({duration:.011,volume:v*.34,filter:'highpass',freq:3100,q:.7});
      tone({type:'triangle',from:540*p,to:355*p,duration:.024,volume:v*.42});
      tone({type:'sine',from:820*p,to:610*p,duration:.017,volume:v*.21,delay:.005});
  }
}

export function playEffect(kind,volume=.45){
  const v=Math.max(0,Math.min(1,volume))*.18;if(v<=0)return;
  if(kind==='buy'){
    tone({from:520,to:590,duration:.05,volume:v});tone({from:700,to:760,duration:.07,volume:v*.7,delay:.035});
  }else if(kind==='rebirth'){
    tone({from:210,to:420,duration:.2,volume:v*.75});tone({type:'triangle',from:420,to:850,duration:.25,volume:v*.8,delay:.08});tone({from:820,to:1200,duration:.28,volume:v*.5,delay:.17});
  }else if(kind==='mutation'){
    tone({type:'triangle',from:300,to:520,duration:.15,volume:v});tone({from:590,to:880,duration:.2,volume:v*.65,delay:.07});
  }else if(kind==='achievement'){
    tone({from:660,to:720,duration:.09,volume:v});tone({from:880,to:940,duration:.12,volume:v,delay:.07});tone({from:1100,to:1180,duration:.16,volume:v*.75,delay:.14});
  }else if(kind==='error'){
    tone({type:'square',from:150,to:105,duration:.085,volume:v*.58});
  }else if(kind==='overcharge'){
    tone({type:'sawtooth',from:170,to:390,duration:.2,volume:v*.35});tone({type:'triangle',from:430,to:920,duration:.28,volume:v*.8,delay:.07});
  }
}
