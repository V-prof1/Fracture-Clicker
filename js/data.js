export const MAX_MONEY = 1e303;

export const CORE_STAGES = [
  {at:0,name:'Dormant Core'},{at:10,name:'Energized Core'},{at:25,name:'Plasma Seed'},{at:50,name:'Unstable Star'},{at:100,name:'Collapsed Star'},{at:250,name:'Black Core'},{at:500,name:'Singularity'},{at:1000,name:'Dimensional Rift'},{at:2500,name:'Void Core'},{at:5000,name:'Reality Fracture'},{at:10000,name:'The Limit'}
];

export const CLICK_UPGRADES = [
  {id:'finger',name:'Reinforced Finger',base:10,growth:1.17,power:1,desc:'+1 base click'},
  {id:'impact',name:'Impact Amplifier',base:240,growth:1.185,power:18,desc:'+18 base click'},
  {id:'shock',name:'Shockwave Touch',base:6500,growth:1.19,power:320,desc:'+320 base click'},
  {id:'plasma',name:'Plasma Strike',base:180000,growth:1.195,power:6200,desc:'+6.2K base click'},
  {id:'quantum',name:'Quantum Touch',base:7.5e6,growth:1.20,power:145000,desc:'+145K base click'},
  {id:'reality',name:'Reality Breaker',base:4.2e9,growth:1.205,power:4.8e6,desc:'+4.8M base click'},
  {id:'void',name:'Void Touch',base:1.4e13,growth:1.21,power:2.1e8,desc:'+210M base click'},
  {id:'limit',name:'Limit Fracture',base:8.8e18,growth:1.215,power:7.5e10,desc:'+75B base click'}
];

export const AUTO_UPGRADES = [
  {id:'autofinger',name:'Auto Finger',base:75,growth:1.18,cps:1,desc:'+1 auto click/s'},
  {id:'hand',name:'Mechanical Hand',base:1900,growth:1.19,cps:8,desc:'+8 auto clicks/s'},
  {id:'bot',name:'Click Bot',base:68000,growth:1.195,cps:55,desc:'+55 auto clicks/s'},
  {id:'array',name:'Click Array',base:3.6e6,growth:1.20,cps:420,desc:'+420 auto clicks/s'},
  {id:'quantumAuto',name:'Quantum Clicker',base:2.4e9,growth:1.205,cps:3900,desc:'+3.9K auto clicks/s'},
  {id:'riftEngine',name:'Rift Engine',base:9.8e12,growth:1.21,cps:52000,desc:'+52K auto clicks/s'},
  {id:'realityMachine',name:'Reality Machine',base:7.7e17,growth:1.215,cps:850000,desc:'+850K auto clicks/s'},
  {id:'infiniteArray',name:'Infinite Array',base:6.5e23,growth:1.22,cps:1.9e7,desc:'+19M auto clicks/s'}
];

export const MUTATIONS = [
  {id:'charged',name:'Charged',mult:1.5,weight:28,duration:35},
  {id:'overheated',name:'Overheated',mult:2,weight:23,duration:32},
  {id:'frozen',name:'Frozen',mult:3,weight:16,duration:30},
  {id:'toxic',name:'Toxic',mult:5,weight:12,duration:28},
  {id:'golden',name:'Golden',mult:10,weight:8,duration:25},
  {id:'radioactive',name:'Radioactive',mult:20,weight:5,duration:22},
  {id:'corrupted',name:'Corrupted',mult:35,weight:3.5,duration:20},
  {id:'void',name:'Void',mult:50,weight:2.4,duration:18},
  {id:'glitched',name:'Glitched',mult:100,weight:1.5,duration:16},
  {id:'celestial',name:'Celestial',mult:250,weight:.6,duration:14}
];
export const SECRET_MUTATION = {id:'secret',name:'???',mult:1000,duration:10};

export const TREE_NODES = [
  {id:'click1',name:'Fractured Touch',desc:'+3% Click Power / level',baseCost:2,max:30},
  {id:'auto1',name:'Automated Pulse',desc:'+3% Auto Clicks / level',baseCost:2,max:30},
  {id:'crit1',name:'Critical Theory',desc:'+0.35% crit chance / level',baseCost:3,max:20},
  {id:'critMult',name:'Critical Force',desc:'+0.25x critical multiplier / level',baseCost:4,max:20},
  {id:'mutationLuck',name:'Mutation Luck',desc:'+0.45% mutation chance / level',baseCost:4,max:25},
  {id:'mutationPower',name:'Unstable Matter',desc:'+3% mutation power / level',baseCost:5,max:30},
  {id:'fragmentGain',name:'Fragment Memory',desc:'+2% Fragment gain / level',baseCost:6,max:25},
  {id:'rebirthPower',name:'Rebirth Echo',desc:'+0.5% Rebirth bonus / level',baseCost:6,max:30},
  {id:'offline',name:'Deep Storage',desc:'+1h offline cap / level',baseCost:5,max:16},
  {id:'rush',name:'Rebirth Rush',desc:'+1s Rebirth Rush / level',baseCost:5,max:25},
  {id:'mission',name:'Mission Yield',desc:'+4% mission rewards / level',baseCost:5,max:25},
  {id:'overcharge',name:'Overcharge Core',desc:'+4% Overcharge power / level',baseCost:7,max:25}
];

export const ACHIEVEMENTS = [
  {id:'c100',name:'Warm Up',desc:'100 manual clicks',type:'manualClicks',goal:100},
  {id:'c1k',name:'Clicking Habit',desc:'1K manual clicks',type:'manualClicks',goal:1000},
  {id:'c10k',name:'Finger Engine',desc:'10K manual clicks',type:'manualClicks',goal:10000},
  {id:'m1k',name:'Pocket Change',desc:'Earn $1K lifetime',type:'lifetimeMoney',goal:1e3},
  {id:'m1m',name:'Millionaire',desc:'Earn $1M lifetime',type:'lifetimeMoney',goal:1e6},
  {id:'m1b',name:'Billionaire',desc:'Earn $1B lifetime',type:'lifetimeMoney',goal:1e9},
  {id:'r1',name:'Again?',desc:'Perform 1 rebirth',type:'rebirths',goal:1},
  {id:'r10',name:'Loop',desc:'Reach 10 rebirths',type:'rebirths',goal:10},
  {id:'r100',name:'Fractured Cycle',desc:'Reach 100 rebirths',type:'rebirths',goal:100},
  {id:'r1k',name:'No Way Back',desc:'Reach 1K rebirths',type:'rebirths',goal:1000},
  {id:'mut1',name:'Unstable',desc:'Witness a mutation',type:'mutationEvents',goal:1},
  {id:'mut100',name:'Mutation Hunter',desc:'Witness 100 mutations',type:'mutationEvents',goal:100},
  {id:'allmut',name:'Collector',desc:'Discover all 10 normal mutations',type:'normalMutations',goal:10},
  {id:'secret',name:'What Was That?',desc:'Discover the secret mutation',type:'secretFound',goal:1},
  {id:'limit',name:'THE LIMIT',desc:'Reach 1 Centillion',type:'maxReached',goal:1}
];

export const SOUND_STYLES = ['classic','soft','slime','mechanical','magnetic','typewriter','digital','crystal','heavy','void'];
