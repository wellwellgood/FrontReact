import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'node:crypto';
import { tokenVault } from './store.js';
export function createGithubRouter({ store, client, env = process.env }) {
  const router = express.Router();
  const cache = new Map();
  const configured = () => Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_REDIRECT_URI && Buffer.from(env.GITHUB_TOKEN_ENCRYPTION_KEY || '', 'base64').length === 32);
  router.use((req,res,next)=> {
    res.set('Cache-Control','no-store');
    try {
      const user=jwt.verify(req.headers.authorization?.match(/^Bearer (.+)$/)?.[1] || '',env.JWT_SECRET,{algorithms:['HS256']});
      if (!Number.isSafeInteger(Number(user.id)) || Number(user.id)<=0) throw new Error('invalid id');
      req.userId=Number(user.id);next();
    } catch { res.status(401).json({message:'로그인이 만료되었습니다. 다시 로그인해 주세요.'}); }
  });
  const run = fn => async(req,res) => { try { await fn(req,res); } catch(error) { res.status(error.code==='23505'?409:(error.status||500)).json({message:error.code==='23505'?'이미 다른 사이트 계정에 연결된 GitHub 계정입니다.':error.status?error.message:'GitHub 연결 처리에 실패했습니다. 서버 설정을 확인해 주세요.'}); } };
  router.get('/status',run(async(req,res)=> { const row=await store.get(req.userId); res.json({configured:configured(),connected:Boolean(row),login:row?.login || null}); }));
  router.post('/connect',run(async(req,res)=> {
    if (!configured()) return res.status(503).json({message:'GitHub 앱 등록 및 서버 환경변수 설정이 필요합니다.'});
    const state=randomBytes(32).toString('hex'), verifier=randomBytes(32).toString('base64url');
    await store.putState(state,req.userId,tokenVault(env.GITHUB_TOKEN_ENCRYPTION_KEY).seal(verifier));
    const params=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:env.GITHUB_REDIRECT_URI,scope:'read:user',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',prompt:'select_account'});
    res.json({url:`https://github.com/login/oauth/authorize?${params}`,state});
  }));
  router.post('/callback',run(async(req,res)=> {
    if (!configured()) return res.status(503).json({message:'GitHub 서버 설정이 필요합니다.'});
    const {state,code}=req.body||{};
    if (typeof state!=='string' || !/^[a-f0-9]{64}$/.test(state) || typeof code!=='string' || !code || code.length>512) return res.status(400).json({message:'잘못된 GitHub 인증 요청입니다.'});
    const verifier=await store.consumeState(state,req.userId);
    if (!verifier) return res.status(400).json({message:'인증 요청이 만료되었거나 계정이 다릅니다. 다시 연결해 주세요.'});
    const vault=tokenVault(env.GITHUB_TOKEN_ENCRYPTION_KEY);
    const token=await client.exchange(code,vault.open(verifier));
    const profile=await client.profile(token.access_token);
    if (!Number.isSafeInteger(profile.id) || typeof profile.login!=='string') return res.status(502).json({message:'GitHub 사용자 정보를 확인하지 못했습니다.'});
    await store.put(req.userId,profile,vault.seal(token.access_token),token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000):null);
    cache.delete(req.userId);res.json({connected:true,login:profile.login});
  }));
  router.get('/dashboard',run(async(req,res)=> {
    const row=await store.get(req.userId);
    if (!row) return res.status(409).json({message:'먼저 GitHub 계정을 연결해 주세요.'});
    if (row.expires_at && new Date(row.expires_at).getTime()<=Date.now()) return res.status(409).json({message:'GitHub 연결이 만료되었습니다. 다시 연결해 주세요.'});
    let entry=cache.get(req.userId);
    if (!entry || entry.token!==row.token || Date.now()-entry.time>=60000) {
      if(cache.size>=100) cache.delete(cache.keys().next().value);
      entry={token:row.token,time:Date.now(),promise:client.dashboard(tokenVault(env.GITHUB_TOKEN_ENCRYPTION_KEY).open(row.token))};
      cache.set(req.userId,entry);
    }
    let data;try {data=await entry.promise;} catch(error) {cache.delete(req.userId);throw error;}
    if (String(data.profile.id)!==String(row.github_id)) {cache.delete(req.userId);return res.status(409).json({message:'GitHub 계정이 변경되었습니다. 다시 연결해 주세요.'});}
    res.json({...data,favorites:row.favorites||[]});
  }));
  router.put('/favorites/:id',run(async(req,res)=> {
    const id=Number(req.params.id);
    if(!Number.isSafeInteger(id)||id<=0||typeof req.body?.enabled!=='boolean') return res.status(400).json({message:'잘못된 프로젝트 정보입니다.'});
    const favorites=await store.favorite(req.userId,id,req.body.enabled);
    if(!favorites) return res.status(409).json({message:'먼저 GitHub를 연결해 주세요.'});
    res.json({favorites});
  }));
  router.delete('/connection',run(async(req,res)=> { await store.remove(req.userId);cache.delete(req.userId);res.json({connected:false}); }));
  return router;
}
