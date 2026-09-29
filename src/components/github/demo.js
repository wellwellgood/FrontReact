export const demoData = {
  profile: { id: 0, login: 'demo-developer', name: '데모 개발자', bio: '데모 전용 예시입니다. 실제 GitHub 계정 데이터가 아닙니다.' },
  repos: [
    {id:1,name:'portfolio-web',fullName:'demo-developer/portfolio-web',description:'프로젝트와 작업 경험을 소개하는 포트폴리오',language:'TypeScript',stars:12,forks:2,updatedAt:'2026-09-28T09:00:00Z'},
    {id:2,name:'react-dashboard',fullName:'demo-developer/react-dashboard',description:'React로 만드는 사용자별 프로젝트 대시보드',language:'JavaScript',stars:8,forks:1,updatedAt:'2026-09-27T06:00:00Z'},
    {id:3,name:'api-server',fullName:'demo-developer/api-server',description:'사용자 인증과 데이터 조회를 위한 API 서버',language:'JavaScript',stars:3,forks:0,updatedAt:'2026-09-25T03:00:00Z'},
  ],
  issues:[{id:4,title:'모바일 메뉴 접근성 개선',number:14,repository:'demo-developer/react-dashboard',updatedAt:'2026-09-28T09:00:00Z'}],
  pullRequests:[{id:5,title:'사용자별 프로젝트 검색 추가',number:21,repository:'demo-developer/react-dashboard',updatedAt:'2026-09-28T09:00:00Z'}],
  issueCount:1,prCount:1,favorites:[2],warnings:[],truncated:false,searchIncomplete:false,
  events:[{id:'a',type:'PushEvent',repo:'demo-developer/react-dashboard',createdAt:'2026-09-28T09:00:00Z'},{id:'b',type:'PullRequestEvent',repo:'demo-developer/react-dashboard',createdAt:'2026-09-27T09:00:00Z'},{id:'c',type:'CreateEvent',repo:'demo-developer/api-server',createdAt:'2026-09-25T03:00:00Z'}],
  fetchedAt:'2026-09-28T09:00:00Z',
};
