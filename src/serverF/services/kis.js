const BASE = 'https://openapi.koreainvestment.com:9443';
export function createKisClient({ env = process.env, fetcher = fetch, now = Date.now } = {}) {
  let token, expires = 0, pendingToken, pendingQuotes, cached, retryAt = 0;
  async function request(path, options) {
    try {
      const response = await fetcher(`${BASE}${path}`, { ...options, signal: AbortSignal.timeout(12000) });
      const body = await response.json();
      if (!response.ok) throw new Error('upstream');
      return body;
    } catch { throw new Error('KIS 서버에 연결할 수 없습니다. 서버 설정과 서비스 상태를 확인해 주세요.'); }
  }
  async function accessToken() {
    if (!env.KIS_APP_KEY || !env.KIS_APP_SECRET) throw new Error('서버에 KIS_APP_KEY와 KIS_APP_SECRET 설정이 필요합니다.');
    if (token && now() < expires) return token;
    if (!pendingToken) pendingToken = (async () => {
      const body = await request('/oauth2/tokenP', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET }) });
      if (!body.access_token || !(Number(body.expires_in) > 60)) throw new Error('KIS 인증에 실패했습니다. 실전용 키를 확인해 주세요.');
      token = body.access_token; expires = now() + (Number(body.expires_in) - 60) * 1000;
      return token;
    })().finally(() => { pendingToken = undefined; });
    return pendingToken;
  }
  return async function quotes() {
    if (cached && now() - cached.time < 30000) return cached.data;
    if (pendingQuotes) return pendingQuotes;
    if (now() < retryAt) throw new Error('시세 조회에 실패했습니다. 1분 뒤 다시 시도해 주세요.');
    pendingQuotes = (async () => {
      const bearer = await accessToken();
      const quotes = [];
      for (const symbol of ['005930', '000660', '069500', '035420']) {
        const body = await request(`/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`, { headers: { authorization: `Bearer ${bearer}`, appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET, tr_id: 'FHKST01010100', custtype: 'P' } });
        const price = Number(body.output?.stck_prpr);
        if (body.rt_cd !== '0' || !Number.isFinite(price) || price <= 0) throw new Error('유효한 KIS 시세를 받지 못했습니다. 잠시 후 다시 시도해 주세요.');
        quotes.push({ symbol, price });
      }
      const data = { source: 'KIS', market: 'KRX', fetchedAt: new Date(now()).toISOString(), quotes };
      cached = { time: now(), data }; return data;
    })().catch(error => { retryAt = now() + 60000; throw error; }).finally(() => { pendingQuotes = undefined; });
    return pendingQuotes;
  };
}
export const getKisQuotes = createKisClient();
