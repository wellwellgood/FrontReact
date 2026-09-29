import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CodeXml as Github, FolderGit2, GitPullRequest, CircleDot, Star, RefreshCw, ExternalLink, Unplug, Activity } from 'lucide-react';
import DashboardHeader from '../navigation/DashboardHeader.jsx';
import { githubRequest, connectGithub } from '../github/api';
import { demoData } from '../github/demo';
import styles from './DashboardOverview.module.css';
const date = value => value ? new Date(value).toLocaleDateString('ko-KR') : '—';
const eventNames = { PushEvent:'코드 푸시', PullRequestEvent:'PR 활동', IssuesEvent:'이슈 활동', IssueCommentEvent:'댓글 작성', CreateEvent:'브랜치·저장소 생성', DeleteEvent:'브랜치·태그 삭제', WatchEvent:'스타 추가', ForkEvent:'저장소 포크', ReleaseEvent:'릴리스', PullRequestReviewEvent:'코드 리뷰' };
function External({url,children}) { return url && /^https:\/\/github\.com\//.test(url) ? <a href={url} target="_blank" rel="noreferrer">{children}<ExternalLink size={14}/></a> : <span>{children}</span>; }
export default function DashboardOverview({ view='overview', demo=false }) {
  const location=useLocation();
  const [data,setData]=useState(demo?demoData:null);
  const [connection,setConnection]=useState(demo?{connected:true,configured:true}:null);
  const [busy,setBusy]=useState(!demo);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [language,setLanguage]=useState('all');
  const [onlyFavorites,setOnlyFavorites]=useState(false);
  const [revision,setRevision]=useState(0);
  const userKey=sessionStorage.getItem('username');
  useEffect(()=> {
    if(demo) {setData(demoData);setConnection({connected:true,configured:true});setBusy(false);return;}
    let active=true;setBusy(true);setError('');setData(null);
    (async()=> {
      try {
        const status=await githubRequest('get','/status');if(!active)return;setConnection(status.data);
        if(status.data.connected) {const result=await githubRequest('get','/dashboard');if(active)setData(result.data);}
      } catch(err) {if(active)setError(err.response?.data?.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');}
      finally {if(active)setBusy(false);}
    })();
    return()=>{active=false;};
  },[demo,revision,userKey]);
  const connect=async()=>{setBusy(true);setError('');try {await connectGithub();}catch(err){setError(err.response?.data?.message||'GitHub 연결을 시작하지 못했습니다.');setBusy(false);}};
  const disconnect=async()=>{
    if(!window.confirm('이 사이트의 GitHub 연결과 프로젝트 즐겨찾기를 해제할까요? GitHub 저장소는 삭제되지 않습니다.'))return;
    setBusy(true);setError('');try{await githubRequest('delete','/connection');setData(null);setConnection(c=>({...c,connected:false}));}catch(err){setError(err.response?.data?.message||'연결을 해제하지 못했습니다.');}finally{setBusy(false);}
  };
  const favorite=async(id)=>{
    const enabled=!data.favorites.includes(id);
    if(demo){setData(d=>({...d,favorites:enabled?[...d.favorites,id]:d.favorites.filter(x=>x!==id)}));return;}
    setBusy(true);setError('');try{const result=await githubRequest('put',`/favorites/${id}`,{enabled});setData(d=>({...d,favorites:result.data.favorites}));}catch(err){setError(err.response?.data?.message||'즐겨찾기를 저장하지 못했습니다.');}finally{setBusy(false);}
  };
  const titles={overview:'내 프로젝트의 흐름을 한눈에',projects:'내 프로젝트',issues:'이슈 · Pull Requests',activity:'최근 개발 활동'};
  const repos=data?.repos||[];
  const filtered=repos.filter(r=>(`${r.name} ${r.description||''}`).toLowerCase().includes(query.toLowerCase())&&(language==='all'||r.language===language)&&(!onlyFavorites||data.favorites.includes(r.id)));
  const languages=repos.reduce((acc,r)=>{const l=r.language||'미분류';acc[l]=(acc[l]||0)+1;return acc;},{});
  const cards=data?[['공개 프로젝트',repos.length,FolderGit2,'blue'],['작성한 열린 이슈',data.issueCount??'—',CircleDot,'green'],['작성한 열린 PR',data.prCount??'—',GitPullRequest,'purple'],['받은 스타',repos.reduce((sum,r)=>sum+r.stars,0),Star,'orange']]:[];
  const show=name=>view==='overview'||view===name;
  return <div className={styles.dashboard}>
    {demo?<header className={styles.header}><strong>DEV DASHBOARD · 데모</strong><Link to="/login">로그인</Link></header>:<DashboardHeader active={view}/>}
    <main className={styles.content}>
      <section className={styles.heading}><div><h1>{titles[view]}</h1><p>{data?`${data.profile.name||data.profile.login}님의 프로젝트와 개발 활동입니다.`:'GitHub를 연결하고 나만의 개발 현황을 확인하세요.'}</p></div><span className={styles.badge}>{demo?'예시 데이터':data?'GitHub 연동':'GitHub 연결'}</span></section>
      {demo&&<nav className={styles.demoNav} aria-label="데모 메뉴">{[['overview','종합 현황'],['projects','프로젝트'],['issues','이슈 · PR'],['activity','활동']].map(([id,label])=><Link key={id} to={id==='overview'?'/demo':`/demo/${id}`} aria-current={view===id?'page':undefined}>{label}</Link>)}</nav>}
      {error&&<div className={styles.sourceNote} role="alert">{error} <Link to="/login">로그인</Link></div>}
      {busy&&<p className={styles.feedback} role="status">불러오는 중…</p>}
      {!demo&&<section className={`${styles.card} ${styles.connection}`}>
        <div><h2><Github/> {connection?.connected?`@${connection.login} 연결됨`:'GitHub 계정 연결'}</h2><p>본인 소유 공개 저장소와 작성한 공개 이슈·PR을 조회합니다.</p>{connection?.configured===false&&<p>관리자의 GitHub 앱 설정이 아직 완료되지 않았습니다.</p>}</div>
        <div className={styles.buttonGroup}><button className={styles.primary} disabled={busy||connection?.configured===false} onClick={connect}><Github/>{connection?.connected?'다시 연결':'GitHub 연결'}</button>{connection?.connected&&<><button className={styles.outline} disabled={busy} onClick={()=>setRevision(n=>n+1)}><RefreshCw/>새로고침</button><button className={styles.outline} disabled={busy} onClick={disconnect}><Unplug/>연결 해제</button></>}</div>
      </section>}
      {!data&&!busy&&<section className={`${styles.card} ${styles.empty}`}><Github size={42}/><h2>{connection?.connected?'데이터를 불러오지 못했습니다':'아직 연결된 프로젝트가 없습니다'}</h2><p>{connection?.connected?'새로고침하거나 GitHub 계정을 다시 연결해 주세요.':'GitHub에서 접근을 허용하면 내 저장소와 활동이 여기에 표시됩니다.'}</p><Link to="/demo">예시 화면 둘러보기</Link></section>}
      {data&&<>
        <p className={styles.sourceNote}>{demo?'데모 전용 가상 데이터입니다. 연결한 계정에는 예시 데이터를 섞지 않습니다.':`조회 시각 ${new Date(data.fetchedAt).toLocaleString('ko-KR')} · 최대 60초 캐시 · 비공개·조직 소유 저장소 제외`}</p>
        {data.warnings.map(w=><p key={w} role="status" className={styles.sourceNote}>{w}</p>)}
        {data.truncated&&<p className={styles.sourceNote}>저장소는 최근 갱신 순 최대 500개이며, 프로젝트·스타·언어 통계는 조회된 범위 기준입니다.</p>}
        {data.searchIncomplete&&<p className={styles.sourceNote}>GitHub 검색 결과가 일부 누락될 수 있습니다. 이슈·PR 통계는 잠시 후 다시 확인해 주세요.</p>}
        <section className={styles.stats} aria-label="GitHub 현황">{cards.map(([label,value,Icon,tone])=><article className={styles.stat} key={label}><span className={`${styles.statIcon} ${styles[tone]}`}><Icon/></span><div className={styles.statText}><span>{label}</span><strong>{typeof value==='number'?value.toLocaleString():value}</strong></div></article>)}</section>
        <div className={styles.grid}>
          {show('projects')&&<section className={`${styles.card} ${view==='projects'?styles.full:''}`}><div className={styles.cardTitle}><h2><FolderGit2/> 프로젝트</h2><span>{filtered.length}개</span></div>
            <div className={styles.filters}><label className={styles.search}>프로젝트 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름 또는 설명"/></label><label className={styles.search}>주요 언어<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="all">전체 언어</option>{Object.keys(languages).filter(l=>l!=='미분류').map(l=><option key={l}>{l}</option>)}</select></label><label className={styles.favoriteFilter}><input type="checkbox" checked={onlyFavorites} onChange={e=>setOnlyFavorites(e.target.checked)}/>즐겨찾기만</label></div>
            {!filtered.length&&<p className={styles.empty}>조건에 맞는 공개 프로젝트가 없습니다.</p>}
            <div className={styles.repoList}>{filtered.map(r=><article className={styles.repoRow} key={r.id}><div><h3><External url={r.url}>{r.name}</External></h3><p>{r.description||'등록된 설명이 없습니다.'}</p><div className={styles.tags}><span>{r.language||'언어 미분류'}</span><span>★ {r.stars}</span><span>포크 {r.forks}</span>{r.archived&&<span>보관됨</span>}</div><small>최근 갱신 {date(r.updatedAt)}</small></div><button disabled={busy} className={styles.bookmark} aria-label={`${r.name} 즐겨찾기`} aria-pressed={data.favorites.includes(r.id)} onClick={()=>favorite(r.id)}><Star fill={data.favorites.includes(r.id)?'currentColor':'none'}/></button></article>)}</div>
          </section>}
          {view==='overview'&&<section className={styles.card}><div className={styles.cardTitle}><h2>프로젝트 언어 분포</h2><span>주요 언어 기준</span></div>{!repos.length?<p>공개 저장소가 생기면 언어 분포가 표시됩니다.</p>:Object.entries(languages).sort((a,b)=>b[1]-a[1]).map(([name,count])=><div className={styles.allocation} key={name}><div><span>{name}</span><span>{count}개 · {(count/repos.length*100).toFixed(1)}%</span></div><progress value={count} max={repos.length} aria-label={`${name} 프로젝트 수`}/></div>)}<p className={styles.demoNote}>코드 줄 수나 개발 숙련도 비율이 아닙니다.</p></section>}
          {show('issues')&&[['작성한 열린 이슈',data.issues,data.issueCount],['작성한 열린 PR',data.pullRequests,data.prCount]].map(([label,items,count])=><section className={styles.card} key={label}><div className={styles.cardTitle}><h2>{label}</h2><span>{count??'조회 실패'}{count!==null?'건':''}</span></div>{!items.length&&<p>{count===null?'데이터를 불러오지 못했습니다.':'작성한 공개 항목이 없습니다.'}</p>}{items.map(i=><article className={styles.stockRow} key={i.id}><div><h3><External url={i.url}>{i.title}</External></h3><small>{i.repository} · #{i.number} · {date(i.updatedAt)}</small></div></article>)}<p className={styles.demoNote}>최근 갱신 순 최대 30건 · 작성자 기준 · 다른 공개 저장소에 기여한 항목 포함</p></section>)}
          {show('activity')&&<section className={`${styles.card} ${styles.full}`}><div className={styles.cardTitle}><h2><Activity/> 최근 공개 활동</h2><span>최대 30개 이벤트</span></div>{!data.events.length&&<p>조회된 공개 활동이 없습니다.</p>}{data.events.map(e=><article className={styles.stockRow} key={e.id}><div><strong>{eventNames[e.type]||'GitHub 활동'}</strong><small>{e.repo}</small></div><time dateTime={e.createdAt}>{date(e.createdAt)}</time></article>)}<p className={styles.demoNote}>GitHub 공개 이벤트 API 기준이며 지연·조회 범위 제한이 있습니다. 전체 커밋 수가 아닙니다.</p></section>}
        </div>
      </>}
      {!demo&&connection?.connected&&<p className={styles.demoNote}>연결 해제는 이 사이트에 저장한 연결을 삭제합니다. GitHub의 앱 승인도 철회하려면 <a href="https://github.com/settings/applications" target="_blank" rel="noreferrer">GitHub 설정</a>에서 해제해 주세요.</p>}
      <span className={styles.demoNote}>{location.pathname.startsWith('/demo')?'데모 변경 사항은 현재 화면에서만 유지됩니다.':''}</span>
    </main>
  </div>;
}
