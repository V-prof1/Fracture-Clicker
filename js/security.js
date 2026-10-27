import {P0,P1,P2,K0,K1,C0,X0} from './runtime/segments.js';
function joinPair(parts){return [parts[0][0]+parts[1][0],parts[2][0]+parts[3][0]]}
function target(parts){return parts.reduce((a,b)=>a+b,0)>>>0}
function mix(value,left,right){let h=2166136261>>>0;const s=`${left}${String(value??'').trim()}${right}`;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
function nickSalt(){return joinPair(P0)}
function codeSalt(){return joinPair(P1)}
function promoSalt(){return [P2[0][0],P2[1][0]+P2[2][0]]}
export function isDevNickname(name){const [l,r]=nickSalt();return mix(name,l,r)===target(K0)}
function devCodeMatches(code){const [l,r]=codeSalt();return mix(code,l,r)===target(K1)}
function proofFor(name){const [l,r]=nickSalt();return (mix(name,l,r)^X0)>>>0}
export function developerReady(state){return isDevNickname(state.settings.nickname)&&state.flags.devProof===proofFor(state.settings.nickname)}
export function redeemLocalCode(raw,state,stamp=Date.now()){
  const code=String(raw||'').trim();
  if(!code)return {ok:false,message:'Digite um código.'};
  if(devCodeMatches(code)&&isDevNickname(state.settings.nickname)){state.flags.devProof=proofFor(state.settings.nickname);return {ok:true,message:'Código aceito.'}}
  const [l,r]=promoSalt(),key=mix(code.toUpperCase(),l,r),promo=C0[key];
  if(!promo)return {ok:false,message:'Código inválido.'};
  state.redeemed=state.redeemed||[];
  if(state.redeemed.includes(promo.id))return {ok:false,message:'Este código já foi usado neste save.'};
  state.redeemed.push(promo.id);
  if(promo.kind==='infiniteOffline')state.flags.infiniteOffline=true;
  else{state.buffs=state.buffs||{};const current=state.buffs[promo.kind],start=Math.max(stamp,current?.until||stamp);state.buffs[promo.kind]={mult:promo.mult,until:start+promo.seconds*1000,label:promo.label}}
  return {ok:true,message:`Ativado: ${promo.label}`};
}
