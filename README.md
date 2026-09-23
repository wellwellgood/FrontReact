# 💼 KKY Dashboard – 취업 준비 대시보드

React + Node.js + PostgreSQL 기반의 **취업 준비 통합 대시보드**입니다.
채용공고 분석부터 지원 현황 관리, 면접 답변 연습까지 취업 준비에 필요한 과정을 한곳에서 관리할 수 있도록 제작했습니다.

# Free Deploy

프론트엔드는 Netlify, 백엔드는 Render, 데이터베이스는 Neon의 무료 플랜을 활용했습니다. 무료 서버의 슬립 모드와 첫 요청 지연을 고려해 배포 환경을 구성했으며, 서비스 확장 시 유료 플랜 전환도 고려하고 있습니다.

## 🔗 배포 링크

- 🖥️ 프론트엔드: [https://dashboardkky.netlify.app](https://dashboardkky.netlify.app)
- 🛠️ 백엔드(API): [https://react-server-wmqa.onrender.com](https://react-server-wmqa.onrender.com)

## ✨ 주요 기능

- 🧑‍💻 로그인 / 회원가입 및 보호된 페이지 접근
- 📊 관심 공고, 지원 완료, 면접 예정 등 취업 현황 확인
- 📄 채용공고와 이력서 비교·분석 화면
- 🗂️ 관심, 지원 완료, 면접, 결과 단계별 지원 현황 관리
- 🎤 예상 면접 질문 선택 및 답변 작성·음성 입력
- ✨ STAR 구조를 기준으로 한 면접 답변 구성 피드백
- 💾 작성한 면접 답변과 지원 현황을 브라우저에 저장
- 🔍 사용자 및 데이터 검색
- ⚙️ 프로필과 계정 설정

## 🧩 기술 스택

### Frontend

- React 18 (Hooks, React Router)
- CSS Modules
- Axios
- Lucide React
- Netlify 배포

### Backend

- Node.js + Express
- PostgreSQL (Neon)
- JWT 인증 및 Cookie 기반 요청 처리
- Multer 파일 업로드
- Socket.IO
- Render 배포

### 기타

- localStorage와 sessionStorage를 이용한 화면 상태 저장
- dotenv를 이용한 서버 환경변수 관리
- Netlify Redirect를 이용한 SPA 새로고침 처리
- 사람인 채용공고 API 연동을 위한 확장 지점 준비

## 📁 프로젝트 구조

```text
📦 FrontReact
├─ public/                         # 정적 파일과 Netlify 리다이렉트 설정
├─ src/
│  ├─ components/
│  │  ├─ Chat/                    # 공고·이력서 분석 화면
│  │  ├─ File/                    # 지원 관리 화면
│  │  ├─ email/                   # 면접 준비 화면
│  │  └─ ProtectedRoute.jsx       # 로그인 확인 라우트
│  ├─ calender/                   # 일정 선택 컴포넌트
│  ├─ image/                      # 화면 이미지 리소스
│  ├─ serverF/                    # 백엔드(Node.js + Express)
│  │  ├─ routes/                  # 인증, 사용자, 검색, 업로드 API
│  │  ├─ middlewares/             # 서버 미들웨어
│  │  ├─ DB.mjs                   # PostgreSQL 연결
│  │  └─ server.mjs               # 백엔드 실행 파일
│  ├─ util/api.js                 # 프론트엔드 API 설정
│  ├─ App.jsx                     # 전체 페이지 라우팅
│  └─ main.js                     # 종합 현황 화면
├─ netlify.toml                   # Netlify 빌드 및 SPA 설정
├─ package.json
└─ README.md
```

## ⚙️ 로컬 실행 방법

### ✅ 환경 변수 설정

`src/serverF/.env` 파일을 만들고 실제 발급값을 입력합니다.

```env
DATABASE_URL=
JWT_SECRET=
NODE_ENV=development
PORT=10000
```

사람인 채용공고 API를 연결할 경우 발급받은 키는 프론트엔드 코드가 아닌 서버 환경변수에 저장해야 합니다.

```env
SARAMIN_API_KEY=
```

### ▶ 실행 절차

```bash
# 1. 저장소 복제
git clone https://github.com/wellwellgood/FrontReact.git
cd FrontReact

# 2. 프론트엔드 의존성 설치 및 실행
npm install
npm start

# 3. 새 터미널에서 백엔드 의존성 설치 및 실행
cd src/serverF
npm install
npm start
```

프론트엔드는 기본적으로 `http://localhost:3000`, 백엔드는 `http://localhost:10000`에서 실행됩니다.

## 🧑‍💻 개발자

| 이름 | 포지션 | GitHub |
|------|--------|--------|
| 김기윤 | 웹 기획 및 프론트엔드 개발 | [@wellwellgood](https://github.com/wellwellgood) |

## 📄 라이선스

MIT License

## 아쉬운 점이나 수정, 필요한 점

현재는 대시보드 화면과 기본적인 사용자 상호작용을 중심으로 구현되어 있습니다. 일부 분석과 피드백은 예시 로직으로 동작하므로, 실제 서비스로 발전시키려면 채용공고 API와 AI 분석 API를 백엔드에서 안전하게 연결해야 합니다.

지원 현황과 면접 답변 일부는 브라우저 저장소를 사용하고 있어 다른 기기와 데이터가 동기화되지 않습니다. 이후에는 사용자 계정별로 데이터베이스에 저장하고, 서버 상태와 화면 상태를 안정적으로 동기화하는 구조가 필요합니다.

프로젝트 규모가 커질 경우에는 반복되는 헤더와 UI 요소를 공통 컴포넌트로 분리하고, 서버 코드를 별도 디렉터리나 저장소로 정리할 계획입니다. 또한 테스트 코드와 오류 처리, 접근성, 모바일 화면 검증을 보완해야 합니다.

## 느낀 점이나 마지막으로 할 말

이 프로젝트는 React를 배우며 시작한 첫 프로젝트를 실제 취업 준비에 활용할 수 있는 대시보드 형태로 확장한 결과물입니다. 처음에는 컴포넌트와 Hooks, JSX 구조가 낯설었지만 화면을 기능별로 나누고 라우팅과 상태를 직접 연결하면서 React의 장점을 이해하게 됐습니다.

특히 종합 현황, 공고·이력서 분석, 지원 관리, 면접 준비 화면을 하나의 서비스 흐름으로 구성하면서 단순히 화면을 만드는 것과 사용자가 실제로 사용할 수 있는 기능을 설계하는 것이 다르다는 점을 배웠습니다.

아직 실제 API 연결, 데이터 영구 저장, 테스트처럼 보완할 부분이 남아 있습니다. 현재 구현을 완성으로 보기보다는 앞으로 백엔드와 외부 API, 상태 관리 방식을 더 깊게 학습하며 개선해 나갈 기반으로 삼고 있습니다.
