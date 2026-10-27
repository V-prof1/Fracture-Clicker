const A=['f','r'],B=['act','ure'],C=['s','h'],D=['a','rd'],E=['r'],F=['i','ft'];
const DEV_NICK_TARGET=[528000000,983960];
const DEV_CODE_TARGET=[3900000000,21152447];
const PROMO_TARGETS={
  1733968114:{id:'fracture2x',kind:'money',mult:2,seconds:300,label:'2x Money · 5m'},
  2973293738:{id:'doublebirth',kind:'rebirth',mult:2,seconds:300,label:'2x Rebirths · 5m'},
  685033126:{id:'luckyvoid',kind:'mutationLuck',mult:2,seconds:600,label:'Mutation Luck · 10m'},
  4027451321:{id:'clickstorm',kind:'click',mult:2,seconds:600,label:'2x Click · 10m'},
  4285573049:{id:'autorush',kind:'auto',mult:2,seconds:600,label:'2x Auto · 10m'},
  2368457191:{id:'eternal',kind:'infiniteOffline',mult:1,seconds:0,label:'Infinite Offline Earnings'}
};

function target(parts){return parts.reduce((a,b)=>a+b,0)>>>0}
function mix(value,left,right){let h=2166136261>>>0;const s=`${left}${String(value??'').trim()}${right}`;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
export function isDevNickname(name){return mix(name,A.join(''),B.join(''))===target(DEV_NICK_TARGET)}
function devCodeMatches(code){return mix(code,C.join(''),D.join(''))===target(DEV_CODE_TARGET)}
function proofFor(name){return (mix(name,A.join(''),B.join(''))^0x6a09e667)>>>0}
export function developerReady(state){return isDevNickname(state.settings.nickname)&&state.flags.devProof===proofFor(state.settings.nickname)}

export function redeemLocalCode(raw,state,now=Date.now()){
  const code=String(raw||'').trim();
  if(!code)return {ok:false,message:'Digite um código.'};
  if(devCodeMatches(code)&&isDevNickname(state.settings.nickname)){
    state.flags.devProof=proofFor(state.settings.nickname);
    return {ok:true,message:'Código aceito.'};
  }
  const key=mix(code.toUpperCase(),E.join(''),F.join(''));
  const promo=PROMO_TARGETS[key];
  if(!promo)return {ok:false,message:'Código inválido.'};
  state.redeemed=state.redeemed||[];
  if(state.redeemed.includes(promo.id))return {ok:false,message:'Este código já foi usado neste save.'};
  state.redeemed.push(promo.id);
  if(promo.kind==='infiniteOffline')state.flags.infiniteOffline=true;
  else{
    state.buffs=state.buffs||{};
    const current=state.buffs[promo.kind];
    const start=Math.max(now,current?.until||now);
    state.buffs[promo.kind]={mult:promo.mult,until:start+promo.seconds*1000,label:promo.label};
  }
  return {ok:true,message:`Ativado: ${promo.label}`};
}
