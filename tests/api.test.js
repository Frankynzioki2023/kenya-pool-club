'use strict';
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path'),{depositBreakdown,prizeShares}=require('../ledger');
assert.deepEqual(depositBreakdown(100000),{gross:100000,fee:15000,credit:85000});
assert.deepEqual(prizeShares(10001,['a','b']),[{id:'a',amount:5001},{id:'b',amount:5000}]);
const port=Number(process.env.TEST_PORT||18887),base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,[path.join(__dirname,'../server.js')],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',POOL_DATA_FILE:path.join(require('node:os').tmpdir(),'pool-test-'+process.pid+'.json')},stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function call(p,b,t,expected=200){const r=await fetch(base+'/api/'+p,{method:b===undefined?'GET':'POST',headers:{...(t?{Authorization:'Bearer '+t}:{}),...(b===undefined?{}:{'Content-Type':'application/json'})},...(b===undefined?{}:{body:JSON.stringify(b)})});const j=await r.json();assert.equal(r.status,expected,JSON.stringify(j));return j;}
(async()=>{try{
 for(let i=0;i<50;i++){if(output.includes('Computer:'))break;await sleep(100);}assert(output.includes('Computer:'),output);
 const a=await call('register',{name:'Alpha',pin:'1234'}),b=await call('register',{name:'Bravo',pin:'5678'});const A=a.token,B=b.token;
 assert.equal((await call('deposit',{amount:1000},A)).account.balance,85000);assert.equal((await call('deposit',{amount:1000},B)).account.balance,85000);
 await call('demo-withdraw',{amount:100000},A,400);await call('demo-withdraw',{amount:-1},A,400);await call('demo-withdraw',{amount:10},null,401);let wd=await call('demo-withdraw',{amount:85},A);assert.equal(wd.account.balance,76500);assert.equal(wd.account.history[0].type,'demo-withdraw');assert.equal(wd.account.history[0].simulated,true);assert.equal((await call('deposit',{amount:100},A)).account.balance,85000);await call('deposit',{amount:-1},A,400);await call('deposit',{amount:1000},null,401);
 let r=await call('create',{mode:'killer',capacity:2,stake:50},A);assert.equal(r.account.balance,80000);const room=r.room.id;
 let s=await call('join',{id:room},B);assert.equal(s.account.balance,80000);assert.equal(s.room.pot,10000);
 s=await call('leave',{},B);assert.equal(s.account.balance,85000);assert.equal(s.account.history[0].type,'refund');
 await call('join',{id:room},B);await call('start',{},B,400);r=await call('start',{},A);assert.equal(r.room.pot,10000);s=await call('state',undefined,B);assert.equal(r.game.actor,s.game.actor);assert.equal(r.game.remaining,156);
 const actor=r.game.actor===r.account.id?A:B,other=actor===A?B:A;
 await call('shoot',{angle:0,power:55},other,400);await call('shoot',{angle:0,power:55},actor);s=await call('state',undefined,other);assert.equal(s.game.phase,'moving');
 for(let i=0;i<140&&s.game.phase==='moving';i++){await sleep(100);s=await call('state',undefined,other);}
 assert.notEqual(s.game.phase,'moving');const q=await call('state',undefined,actor);assert.equal(q.game.actor,s.game.actor);assert.deepEqual(q.game.players,s.game.players);
 const c=await call('register',{name:'Practice',pin:'1234'});r=await call('create',{mode:'triangle',practice:true},c.token);assert.equal(r.account.balance,0);assert.equal(r.room.pot,0);assert.equal(r.game.mode,'triangle');await call('leave',{},c.token);assert.equal((await call('state',undefined,c.token)).account.balance,0);
 console.log('Wallet math, API authorization, deposits, stake reservation, refund, shared online shot and free practice passed.');
 }finally{child.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
