import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { tokenVault } from '../github/store.js';
import { createGithubRouter } from '../github/router.js';
import { githubClient } from '../github/client.js';

test('token encryption roundtrip, randomized ciphertext and tamper protection',()=>{
 const vault=tokenVault(randomBytes(32).toString('base64'));
 const sealed=vault.seal('private-token');assert.equal(vault.open(sealed),'private-token');assert.notEqual(sealed,vault.seal('private-token'));assert.ok(!sealed.includes('private-token'));
 const damaged=Buffer.from(sealed,'base64');damaged[20]^=1;assert.throws(()=>vault.open(damaged.toString('base64')));
 assert.throws(()=>tokenVault('bad-key'));
});

test('two logged-in users have isolated OAuth states, tokens, dashboards and favorites',async()=>{
 const env={JWT_SECRET:'test-only',GITHUB_CLIENT_ID:'client',GITHUB_CLIENT_SECRET:'secret',GITHUB_REDIRECT_URI:'http://localhost/github/callback',GITHUB_TOKEN_ENCRYPTION_KEY:randomBytes(32).toString('base64')};
 const rows=new Map(), states=new Map();let exchanges=0;
 const store={
  get:async id=>rows.get(id),
  putState:async(state,id,verifier)=>states.set(state,{id,verifier}),
  consumeState:async(state,id)=>{const entry=states.get(state);if(!entry||entry.id!==id)return;states.delete(state);return entry.verifier;},
  put:async(id,p,token,expires_at)=>rows.set(id,{github_id:p.id,login:p.login,token,expires_at,favorites:[]}),
  favorite:async(id,repo,enabled)=>{const row=rows.get(id);if(!row)return;row.favorites=enabled?[...new Set([...row.favorites,repo])]:row.favorites.filter(x=>x!==repo);return row.favorites;},
  remove:async id=>rows.delete(id),
 };
 const client={
  exchange:async(code,verifier)=>{exchanges++;assert.ok(verifier.length>=43);return {access_token:code};},
  profile:async token=>({id:token==='alice'?101:202,login:token}),
  dashboard:async token=>({profile:{id:token==='alice'?101:202,login:token},repos:[{name:token+'-repo'}]}),
 };
 const app=express();app.use(express.json());app.use('/api/github',createGithubRouter({store,client,env}));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api/github`;
 const request=(id,path,method='GET',body)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(id?{Authorization:`Bearer ${jwt.sign({id},env.JWT_SECRET,{expiresIn:'1h'})}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try {
  assert.equal((await request(null,'/status')).status,401);
  assert.equal((await request(1,'/dashboard')).status,409);
  const a=await (await request(1,'/connect','POST')).json();const b=await (await request(2,'/connect','POST')).json();
  assert.notEqual(a.state,b.state);assert.equal(new URL(a.url).searchParams.get('code_challenge_method'),'S256');
  assert.equal((await request(2,'/callback','POST',{state:a.state,code:'alice'})).status,400);assert.equal(exchanges,0);
  assert.equal((await request(1,'/callback','POST',{state:a.state,code:'alice'})).status,200);
  assert.equal((await request(1,'/callback','POST',{state:a.state,code:'alice'})).status,400);
  assert.equal((await request(2,'/callback','POST',{state:b.state,code:'bob'})).status,200);
  assert.notEqual(rows.get(1).token,'alice');
  const [da,db]=await Promise.all([request(1,'/dashboard?user_id=2').then(r=>r.json()),request(2,'/dashboard').then(r=>r.json())]);
  assert.equal(da.profile.login,'alice');assert.equal(db.profile.login,'bob');assert.equal(da.repos[0].name,'alice-repo');assert.equal(db.repos[0].name,'bob-repo');assert.ok(!('token' in da));
  await request(1,'/favorites/10','PUT',{enabled:true});assert.deepEqual(rows.get(1).favorites,[10]);assert.deepEqual(rows.get(2).favorites,[]);
  await request(1,'/favorites/10','PUT',{enabled:false});assert.deepEqual(rows.get(1).favorites,[]);
  await request(1,'/connection','DELETE');assert.equal((await request(1,'/dashboard')).status,409);assert.equal((await request(2,'/dashboard')).status,200);
  rows.get(2).expires_at=new Date(0);assert.equal((await request(2,'/dashboard')).status,409);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});

test('GitHub client filters private/other-owned repositories and reports partial failures',async()=>{
 const c=githubClient({fetcher:async(url,options)=>{
  assert.equal(options.headers.Authorization,'Bearer token');
  let data;
  if(url.endsWith('/user'))data={id:1,login:'alice'};
  else if(url.includes('/user/repos'))data=[{id:1,name:'mine',owner:{id:1},private:false},{id:2,name:'private',owner:{id:1},private:true},{id:3,name:'other',owner:{id:2},private:false}];
  else if(url.includes('/events/public'))data=[{id:'1',actor:{id:1},repo:{name:'alice/mine'},type:'PushEvent'},{id:'2',actor:{id:2},repo:{name:'other/repo'}}];
  else if(decodeURIComponent(url).includes('is:issue'))return {ok:false,status:429};
  else data={items:[],total_count:0};
  return {ok:true,status:200,json:async()=>data};
 }});
 const result=await c.dashboard('token');assert.equal(result.repos.length,1);assert.equal(result.repos[0].name,'mine');assert.equal(result.events.length,1);assert.equal(result.issueCount,null);assert.equal(result.prCount,0);assert.equal(result.warnings.length,1);
});
