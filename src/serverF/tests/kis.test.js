import test from 'node:test';
import assert from 'node:assert/strict';
import { createKisClient } from '../services/kis.js';
test('deduplicates requests, caches quotes and token, and uses production quote endpoint only', async () => {
 let time = 100000, authCalls = 0, priceCalls = 0;
 const client = createKisClient({ env: { KIS_APP_KEY: 'test', KIS_APP_SECRET: 'secret' }, now: () => time, fetcher: async (url, options) => {
   assert.ok(url.startsWith('https://openapi.koreainvestment.com:9443/'));
   if (url.endsWith('/oauth2/tokenP')) { authCalls++; return {ok:true,json:async()=>({access_token:'test-token',expires_in:86400})}; }
   assert.ok(url.includes('/quotations/inquire-price?')); assert.equal(options.headers.tr_id,'FHKST01010100'); priceCalls++;
   return {ok:true,json:async()=>({rt_cd:'0',output:{stck_prpr:'80000'}})};
 }});
 const [a,b] = await Promise.all([client(),client()]); assert.deepEqual(a,b); assert.equal(authCalls,1); assert.equal(priceCalls,4);
 await client(); assert.equal(priceCalls,4); time+=31000; await client(); assert.equal(authCalls,1); assert.equal(priceCalls,8);
 assert.equal(JSON.stringify(a).includes('test-token'),false);
});
test('rejects missing configuration without a network call', async()=>{
 const client=createKisClient({env:{},fetcher:()=>{throw new Error('must not call');}});
 await assert.rejects(client(),/KIS_APP_KEY/);
});
test('rejects incomplete prices and applies retry cooldown',async()=>{
 let calls=0;
 const client=createKisClient({env:{KIS_APP_KEY:'x',KIS_APP_SECRET:'y'},fetcher:async(url)=>{
  calls++; return {ok:true,json:async()=>url.endsWith('tokenP')?{access_token:'t',expires_in:86400}:{rt_cd:'0',output:{stck_prpr:''}}};
 }});
 await assert.rejects(client(),/유효한/); assert.equal(calls,2);
 await assert.rejects(client(),/1분/); assert.equal(calls,2);
});
