export class GithubError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}
export function githubClient({ fetcher = fetch, env = process.env } = {}) {
  async function request(url, options = {}) {
    let response;
    try { response = await fetcher(url, { ...options, signal: AbortSignal.timeout(15000) }); }
    catch { throw new GithubError('GitHub 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'); }
    if (response.status === 401) throw new GithubError('GitHub 연결이 만료되었습니다. 다시 연결해 주세요.', 409);
    if (response.status === 403 || response.status === 429) throw new GithubError('GitHub 접근 권한 또는 요청 한도를 확인해 주세요. 잠시 후 다시 시도할 수 있습니다.', 429);
    if (!response.ok) throw new GithubError('GitHub 데이터를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    return response.json();
  }
  const api = (token, path) => request(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'FrontReact-Developer-Dashboard' } });
  return {
    async exchange(code, verifier) {
      const result = await request('https://github.com/login/oauth/access_token', { method:'POST', headers:{ Accept:'application/json','Content-Type':'application/json' }, body:JSON.stringify({ client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,redirect_uri:env.GITHUB_REDIRECT_URI,code,code_verifier:verifier }) });
      if (!result.access_token) throw new GithubError('GitHub 인증이 취소되었거나 만료되었습니다. 다시 연결해 주세요.',400);
      return result;
    },
    profile: token => api(token, '/user'),
    async dashboard(token) {
      const profile = await api(token,'/user');
      const repos = []; let truncated = false;
      for (let page=1;page<=5;page++) {
        const batch = await api(token,`/user/repos?visibility=public&affiliation=owner&sort=updated&per_page=100&page=${page}`);
        if (!Array.isArray(batch)) throw new GithubError('저장소 응답 형식이 올바르지 않습니다.');
        repos.push(...batch.filter(r => !r.private && r.owner?.id === profile.id));
        if (batch.length < 100) break;
        if (page===5) truncated=true;
      }
      const query = type => `/search/issues?q=${encodeURIComponent(`author:${profile.login} is:${type} is:open is:public`)}&sort=updated&per_page=30`;
      const results = await Promise.allSettled([api(token,query('issue')),api(token,query('pr')),api(token,`/users/${encodeURIComponent(profile.login)}/events/public?per_page=30`)]);
      const warnings = results.flatMap((r,i)=>r.status==='rejected' ? [`${['이슈','PR','활동'][i]} 데이터를 가져오지 못했습니다. 새로고침으로 다시 시도해 주세요.`] : []);
      const value = i => results[i].status==='fulfilled' ? results[i].value : null;
      const items = data => data?.items?.map(i=>({ id:i.id,title:i.title,url:i.html_url,number:i.number,updatedAt:i.updated_at,repository:i.repository_url?.split('/').slice(-2).join('/') })) || [];
      return {
        profile:{ id:profile.id,login:profile.login,name:profile.name,avatar:profile.avatar_url,url:profile.html_url,bio:profile.bio,followers:profile.followers },
        repos:repos.map(r=>({ id:r.id,name:r.name,fullName:r.full_name,description:r.description,url:r.html_url,language:r.language,stars:r.stargazers_count,forks:r.forks_count,updatedAt:r.updated_at,archived:r.archived })),
        issues:items(value(0)),pullRequests:items(value(1)),issueCount:value(0)?.total_count ?? null,prCount:value(1)?.total_count ?? null,
        events:(value(2)||[]).filter(e=>e.actor?.id===profile.id).map(e=>({id:e.id,type:e.type,repo:e.repo?.name,createdAt:e.created_at})),
        warnings,truncated,searchIncomplete:Boolean(value(0)?.incomplete_results || value(1)?.incomplete_results),fetchedAt:new Date().toISOString(),
      };
    },
  };
}
