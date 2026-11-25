'use strict';
// Server-authoritative, fixed-step prototype. All currency in the server is virtual.
const W=1000,H=500,L=70,R=930,T=65,B=435,RAD=12,LINE=270,MID=500;
const SEQ=[3,4,5,6,7,8,9,10,11,12,13,14,15,1,2];
const POCKETS=[[L,T],[MID,T],[R,T],[L,B],[MID,B],[R,B]];
const value=n=>n===1?16:n===2?17:n<=6?6:n;
const group=n=>n>=1&&n<=7?'solids':n>=9&&n<=15?'stripes':null;
const makeBall=(n,x,y)=>({n,x,y,vx:0,vy:0,live:true,q:[0,0,0,1]});
function rack(mode){
 const balls=[makeBall(0,LINE,250)];
 if(mode==='killer'){
  const p=[[3,730,250],[4,R-RAD,190],[15,R-RAD,310],[1,R-RAD,250],[9,L+RAD,190],[10,L+RAD,310],[2,L+RAD,250],[5,620,T+RAD],[14,680,T+RAD],[6,620,B-RAD],[13,680,B-RAD],[7,320,T+RAD],[12,380,T+RAD],[8,320,B-RAD],[11,380,B-RAD]];
  p.forEach(a=>balls.push(makeBall(...a)));
 }else{
  const ns=[1,10,5,13,8,3,6,11,2,15,9,4,12,7,14];let k=0;
  for(let col=0;col<5;col++)for(let row=0;row<=col;row++)balls.push(makeBall(ns[k++],670+col*(Math.sqrt(3)*RAD+.25),250+(row-col/2)*(2*RAD+.15)));
 }
 return balls;
}
function target(g){return g.mode==='killer'?(SEQ.find(n=>g.balls.some(b=>b.n===n&&b.live))??null):null;}
function remaining(g){return g.balls.filter(b=>b.live&&b.n).reduce((s,b)=>s+(g.mode==='killer'?value(b.n):1),0);}
function cue(g){return g.balls[0];}
function setPhase(g,phase,actor,now=Date.now()){g.phase=phase;g.actor=actor;g.deadline=now+30000;g.aim=0;g.power=0;}
function emit(g,type,text,extra={}){g.events.push({id:++g.eventId,type,text,...extra});if(g.events.length>24)g.events.shift();}
function createGame(mode,users,practice=false,now=Date.now(),shuffle=true){
 let ps=users.map(u=>({id:u.id,name:u.name,score:0,active:true,group:null}));
 if(shuffle)for(let i=ps.length-1;i>0;i--){const j=require('node:crypto').randomInt(i+1);[ps[i],ps[j]]=[ps[j],ps[i]];}
 const g={mode,practice,players:ps,balls:rack(mode),turn:0,phase:'aim',actor:ps[0].id,deadline:now+30000,aim:0,power:0,events:[],eventId:0,first:null,potted:[],scratch:false,shotTarget:null,still:0,shots:0,fouler:null,placementTarget:null,shotsLeft:1,winners:[],settled:false,ended:false,lastImpact:0};
 emit(g,'start',`${ps[0].name} opens the match`);return g;
}
function shotScore(targetBall,first,potted,scratch){
 if(first===null)return -value(targetBall); // provisional no-contact scratch = target penalty only
 if(first!==targetBall)return -value(first)-(scratch?2:0);
 if(scratch)return potted.length?0:-2;
 return potted.reduce((s,n)=>s+value(n),0);
}
function conclude(g,ids,reason){g.ended=true;g.phase='finished';g.actor=null;g.deadline=null;g.winners=ids;emit(g,'winner',`${g.players.filter(p=>ids.includes(p.id)).map(p=>p.name).join(' & ')} ${ids.length===1?'wins':'tie'}!`,{reason});}
function eligibility(g){
 const top=Math.max(...g.players.map(p=>p.score)),left=remaining(g);
 if(g.practice){if(left===0){conclude(g,[g.players[0].id],'Practice complete');return true;}return false;}
 for(const p of g.players){const was=p.active;p.active=p.score+left>=top;if(was!==p.active)emit(g,p.active?'restore':'drop',p.name+(p.active?' is back in play':' is temporarily dropped'));}
 const active=g.players.filter(p=>p.active);
 if(!left||active.length===1){conclude(g,g.players.filter(p=>p.score===top).map(p=>p.id),!left?'All balls pocketed':'Last eligible player');return true;}
 return false;
}
function next(g){do{g.turn=(g.turn+1)%g.players.length;}while(!g.players[g.turn].active);}
function moveBall(b,x,y){Object.assign(b,{x,y,vx:0,vy:0,live:true,q:[0,0,0,1]});}
function freeAt(g,x,y,ignore=0){return x>=L+RAD&&x<=R-RAD&&y>=T+RAD&&y<=B-RAD&&!POCKETS.some(p=>Math.hypot(x-p[0],y-p[1])<33)&&!g.balls.some(b=>b.live&&b.n!==ignore&&Math.hypot(x-b.x,y-b.y)<2*RAD+1);}
function clearLine(g,x,y,n){const c=cue(g),dx=x-c.x,dy=y-c.y,d2=dx*dx+dy*dy;if(!c.live||d2<(2*RAD+2)**2)return false;return !g.balls.some(b=>{if(!b.live||b.n===0||b.n===n)return false;const t=((b.x-c.x)*dx+(b.y-c.y)*dy)/d2;if(t<=0||t>=1)return false;return Math.hypot(b.x-c.x-t*dx,b.y-c.y-t*dy)<2*RAD+1;});}
function targetSpot(g,n){for(let x of [730,600,850,530,780,900])for(let y of [250,150,350,100,400,200,300])if(freeAt(g,x,y,n)&&clearLine(g,x,y,n))return {x,y};return null;}
function whiteSpot(g){for(let y of [250,200,300,150,350,100,400,80,420])if(freeAt(g,LINE,y,0))return y;for(let y=T+RAD;y<=B-RAD;y+=2)if(freeAt(g,LINE,y,0))return y;return null;}
function afterWhite(g,now){
 if(g.mode==='killer'&&g.placementTarget!==null&&g.balls.some(b=>b.live&&b.n===g.placementTarget)){
  setPhase(g,'place-target',g.fouler,now);emit(g,'place','Previous player may position the target on the right half for a clear shot.');
 }else setPhase(g,'aim',g.players[g.turn].id,now);
}
function placeWhite(g,actor,y,now=Date.now()){
 if(g.phase!=='place-white'||g.actor!==actor)return 'Not your cue-ball placement';
 if(!Number.isFinite(y)||!freeAt(g,LINE,y,0))return 'Choose an empty spot on the white line';
 moveBall(cue(g),LINE,y);afterWhite(g,now);return null;
}
function placeTarget(g,actor,x,y,keep=false,now=Date.now()){
 if(g.phase!=='place-target'||g.actor!==actor)return 'Not your target-ball placement';
 const b=g.balls.find(b=>b.n===g.placementTarget&&b.live);if(!b)return 'Target no longer available';
 if(keep){if(!clearLine(g,b.x,b.y,b.n))return 'The target is blocked; move it to the right half';}
 else{if(!Number.isFinite(x)||!Number.isFinite(y)||x<MID+RAD||!freeAt(g,x,y,b.n)||!clearLine(g,x,y,b.n))return 'Place the target in open space on the right half with a clear path from white';moveBall(b,x,y);}
 setPhase(g,'aim',g.players[g.turn].id,now);emit(g,'place',`${g.players[g.turn].name} to shoot`);return null;
}
function beginPlacement(g,fouler,now){g.fouler=fouler;g.placementTarget=target(g);cue(g).live=false;setPhase(g,'place-white',g.players[g.turn].id,now);emit(g,'place','Next player: position white anywhere along the line');}
function finishKiller(g,now){
 const p=g.players[g.turn],delta=shotScore(g.shotTarget,g.first,g.potted,g.scratch),legal=g.first===g.shotTarget;
 p.score+=delta;emit(g,!legal||g.scratch?'foul':g.potted.length>1?'combo':g.potted.length?'pot':'miss',`${p.name} · ${delta>0?'+':''}${delta} pts${g.scratch?' · white pocketed':!legal?' · foul':''}`,{delta});
 if(eligibility(g))return;
 if(!(legal&&!g.scratch&&g.potted.length))next(g);
 if(g.scratch)beginPlacement(g,p.id,now);else setPhase(g,'aim',g.players[g.turn].id,now);
}
function finishTriangle(g,now){
 const p=g.players[g.turn],opp=g.players[(g.turn+1)%g.players.length];
 const firstGroup=group(g.first),hadOwn=g.ownBefore>0,open=!p.group;
 let foul=g.scratch||g.first===null||(open?g.first===8:hadOwn?firstGroup!==p.group:g.first!==8);
 if(g.potted.includes(8)){
  if(g.shots===1){ // provisional black on break: respot, continue assessment
   const b=g.balls.find(b=>b.n===8);let spot=[730,250];if(!freeAt(g,...spot,8)){for(let y=90;y<=410;y+=20)if(freeAt(g,730,y,8)){spot=[730,y];break;}}moveBall(b,...spot);g.potted=g.potted.filter(n=>n!==8);
  }else{const legalBlack=!foul&&!open&&!hadOwn;conclude(g,[legalBlack||g.practice?p.id:opp.id],legalBlack?'Legal black':'Premature black / foul');return;}
 }
 if(open&&!foul){const n=g.potted.find(n=>group(n));if(n){p.group=group(n);if(opp!==p)opp.group=p.group==='solids'?'stripes':'solids';}}
 const ownPots=g.potted.filter(n=>group(n)&&(!p.group||group(n)===p.group));
 p.score+=ownPots.length;
 if(foul){emit(g,'foul',`${p.name} fouled · next player gets two shots`);next(g);g.shotsLeft=2;}
 else if(ownPots.length){emit(g,ownPots.length>1?'combo':'pot',`${p.name} · ${ownPots.length} legal pot${ownPots.length>1?'s':''}`);}
 else{emit(g,'miss',`${p.name} · no legal pot`);if(g.shotsLeft>1)g.shotsLeft--;else{next(g);g.shotsLeft=1;}}
 if(g.scratch)beginPlacement(g,p.id,now);else setPhase(g,'aim',g.players[g.turn].id,now);
}
function finishShot(g,now=Date.now()){if(g.mode==='killer')finishKiller(g,now);else finishTriangle(g,now);}
function shoot(g,actor,angle,power,now=Date.now(),spinX=0,spinY=0){
 if(g.ended||g.phase!=='aim'||g.actor!==actor||now>=g.deadline)return 'Not your turn';
 if(!Number.isFinite(angle)||!Number.isFinite(power)||power<5||power>100)return 'Invalid shot';
 if(!Number.isFinite(spinX)||!Number.isFinite(spinY)||Math.hypot(spinX,spinY)>1.001)return 'Invalid spin';g.spinX=spinX;g.spinY=spinY;g.spinApplied=false;g.aim=angle;g.power=power;g.first=null;g.potted=[];g.scratch=false;g.shotTarget=target(g);g.still=0;g.shots++;
 const p=g.players[g.turn];g.ownBefore=p.group?g.balls.filter(b=>b.live&&group(b.n)===p.group).length:0;
 const s=1.2+power*.095;cue(g).vx=Math.cos(angle)*s;cue(g).vy=Math.sin(angle)*s;g.phase='moving';g.deadline=null;emit(g,'cue','');return null;
}
function roll(b,dx,dy){const d=Math.hypot(dx,dy);if(d<1e-6)return;const h=d/(2*RAD),s=Math.sin(h),a=-dy/d*s,c=dx/d*s,w=Math.cos(h),[x,y,z,qw]=b.q;const out=[w*x+a*qw+c*z,w*y+c*qw-a*z,w*z+a*y-c*x,w*qw-a*x-c*y];const m=Math.hypot(...out);b.q=out.map(v=>v/m);}
function step(g,now=Date.now()){
 if(g.phase!=='moving')return;
 const bs=g.balls.filter(b=>b.live);
 for(const b of bs){const dx=b.vx,dy=b.vy;b.x+=dx;b.y+=dy;roll(b,dx,dy);b.vx*=.990;b.vy*=.990;if(Math.hypot(b.vx,b.vy)<.045)b.vx=b.vy=0;
  if(POCKETS.some(([x,y])=>Math.hypot(b.x-x,b.y-y)<25)){b.live=false;b.vx=b.vy=0;if(!b.n)g.scratch=true;else g.potted.push(b.n);emit(g,'pocket','',{ball:b.n});continue;}
  const wallX=b.x<L+RAD||b.x>R-RAD,wallY=b.y<T+RAD||b.y>B-RAD;if(b.n===0&&g.spinX){if(wallX)b.vy+=g.spinX*Math.abs(b.vx)*.22*Math.sign(b.vx);if(wallY)b.vx-=g.spinX*Math.abs(b.vy)*.22*Math.sign(b.vy);if(wallX||wallY)g.spinX*=.65;}if(b.x<L+RAD){b.x=L+RAD;b.vx=Math.abs(b.vx)*.84;}if(b.x>R-RAD){b.x=R-RAD;b.vx=-Math.abs(b.vx)*.84;}if(b.y<T+RAD){b.y=T+RAD;b.vy=Math.abs(b.vy)*.84;}if(b.y>B-RAD){b.y=B-RAD;b.vy=-Math.abs(b.vy)*.84;}
 }
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i],b=bs[j];if(!a.live||!b.live)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<2*RAD&&d>1e-6){let nx=dx/d,ny=dy/d,over=(2*RAD-d)/2;a.x-=nx*over;a.y-=ny*over;b.x+=nx*over;b.y+=ny*over;let rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rel>0){if(g.first===null&&(a.n===0||b.n===0))g.first=a.n||b.n;let impulse=rel*.975;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;if(!g.spinApplied&&(a.n===0||b.n===0)){const c=a.n===0?a:b,sign=a.n===0?1:-1,follow=(g.spinY||0)*rel*.48;c.vx+=sign*nx*follow;c.vy+=sign*ny*follow;g.spinApplied=true;}if(rel>1.3&&now-g.lastImpact>65){emit(g,'impact','',{strength:Math.min(1,rel/12)});g.lastImpact=now;}}}}
 for(const b of bs)if(b.live){b.x=Math.max(L+RAD,Math.min(R-RAD,b.x));b.y=Math.max(T+RAD,Math.min(B-RAD,b.y));}
 if(g.balls.every(b=>!b.live||(!b.vx&&!b.vy)))g.still++;else g.still=0;if(g.still>6)finishShot(g,now);
}
function tickClock(g,now=Date.now()){
 if(g.ended||g.deadline===null||now<g.deadline)return;
 if(g.phase==='aim'){const p=g.players[g.turn];if(g.mode==='triangle'&&g.shotsLeft>1)g.shotsLeft--;else{next(g);g.shotsLeft=1;}emit(g,'timeout',`${p.name} timed out · no points deducted`);setPhase(g,'aim',g.players[g.turn].id,now);}
 else if(g.phase==='place-white'){const y=whiteSpot(g);if(y!==null)placeWhite(g,g.actor,y,now);else setPhase(g,'place-white',g.actor,now);}
 else if(g.phase==='place-target'){const b=g.balls.find(b=>b.n===g.placementTarget&&b.live);if(b&&clearLine(g,b.x,b.y,b.n))placeTarget(g,g.actor,0,0,true,now);else{const s=targetSpot(g,g.placementTarget);if(s)placeTarget(g,g.actor,s.x,s.y,false,now);else{emit(g,'place','No clear right-half spot found; choose a position manually.');setPhase(g,'place-target',g.actor,now);}}}
}
function snapshot(g){return {mode:g.mode,practice:g.practice,players:g.players,balls:g.balls,turn:g.turn,phase:g.phase,actor:g.actor,deadline:g.deadline,aim:g.aim,power:g.power,events:g.events,target:target(g),remaining:remaining(g),winners:g.winners,ended:g.ended,shotsLeft:g.shotsLeft,placementTarget:g.placementTarget};}
module.exports={W,H,L,R,T,B,RAD,LINE,MID,SEQ,POCKETS,value,group,rack,target,remaining,createGame,shotScore,eligibility,finishShot,shoot,step,tickClock,placeWhite,placeTarget,clearLine,freeAt,snapshot,roll};
