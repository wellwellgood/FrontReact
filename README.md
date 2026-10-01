# DEV DASHBOARD

React · Express · PostgreSQL 기반의 **사용자별 GitHub 프로젝트 대시보드**입니다.
사이트에 로그인한 뒤 자신의 GitHub 계정을 연결하면 공개 저장소, 작성한 이슈와 PR, 최근 활동을 한곳에서 확인할 수 있습니다.

기존 프로젝트의 로그인·회원가입·계정 설정과 카드형 UI를 유지하면서, 외부 API로 사용자마다 다른 데이터를 보여주는 서비스로 전환했습니다.

## 주요 기능

- **대시보드**: 조회한 공개 저장소 수, 스타 합계, 작성한 열린 이슈·PR, 주요 언어 분포, 최근 공개 활동
- **프로젝트**: 본인 소유 공개 저장소 검색, 언어 필터, 계정별 즐겨찾기 저장
- **이슈·PR**: 본인이 작성한 공개 이슈·PR 조회 및 GitHub 원문 이동
- **활동**: 최근 공개 GitHub 이벤트 조회
- **계정 설정**: 기존 로그인·회원가입, 프로필·알림 선호 설정, GitHub 연결·해제
- **데모**: 로그인과 백엔드 없이 예시 데이터로 화면 탐색

## 사용 흐름

1. 사이트에 회원가입하고 로그인합니다.
2. 대시보드에서 **GitHub 연결**을 선택합니다.
3. GitHub에서 OAuth App 접근을 승인합니다.
4. 연결된 계정의 공개 프로젝트와 활동을 확인합니다.

사이트 로그인과 GitHub 연결은 별개입니다. 다른 사용자가 로그인하면 그 사용자가 연결한 GitHub 계정의 데이터를 조회합니다. 동일한 GitHub 계정은 하나의 사이트 계정에만 연결할 수 있습니다.

## 실제 데이터와 데모 데이터

- **GitHub API**: 사용자 프로필, 본인 소유 공개 저장소, 작성한 열린 공개 이슈·PR, 최근 공개 이벤트
- **PostgreSQL**: 사이트 회원, 암호화된 GitHub 접근 토큰, OAuth 연결 요청, 사용자별 즐겨찾기
- **브라우저 저장소**: 로그인 상태와 사용자별 프로필·알림 선호 설정. 다른 기기와 자동 동기화되지 않습니다.
- **`/demo`**: `src/components/github/demo.js`의 고정 예시 데이터. 실제 계정 화면과 구분합니다.

실제 계정의 API 조회에 실패했을 때 데모 데이터로 대체하지 않습니다. 일부 조회 실패는 해당 영역에 오류 또는 제한 안내로 표시합니다.

## 기술 스택

- **Frontend**: React 18, React Router, Axios, CSS Modules, Lucide React
- **Backend**: Node.js, Express 5, PostgreSQL 드라이버 `pg`
- **인증·연동**: JWT, bcrypt, GitHub OAuth App, GitHub REST API
- **토큰 보호**: AES-256-GCM, OAuth state, PKCE
- **배포 구성**: Netlify(프론트엔드), Render(백엔드), Neon(PostgreSQL)

## 프로젝트 구조

```text
FrontReact/
├── public/                         # 정적 리소스
├── src/
│   ├── components/
│   │   ├── dashboard/              # 대시보드·프로젝트·이슈·활동 화면
│   │   ├── github/                 # API 요청, OAuth 콜백, 데모 데이터
│   │   ├── account/                # 프로필·계정·알림 설정
│   │   ├── navigation/             # 공통 헤더
│   │   └── ProtectedRoute.jsx      # 로그인 확인
│   ├── serverF/
│   │   ├── github/
│   │   │   ├── client.js           # GitHub API 호출 및 결과 정리
│   │   │   ├── router.js           # 인증·계정 연결·조회 API
│   │   │   └── store.js            # DB 저장 및 토큰 암호화
│   │   ├── routes/                 # 기존 인증·사용자 등 API
│   │   ├── tests/github.test.js    # GitHub 연동 테스트
│   │   ├── DB.mjs                  # PostgreSQL 연결 풀
│   │   ├── initDB.js               # 회원 테이블 초기화
│   │   └── server.mjs              # 백엔드 진입점
│   ├── util/api.js                 # API 서버 주소 설정
│   └── App.jsx                    # 페이지 라우팅
├── netlify.toml                    # 빌드 및 SPA 리다이렉트 설정
├── GITHUB_DASHBOARD.md             # GitHub 연동 보충 문서
└── package.json
```

이전 채용·자산 대시보드와 채팅·업로드 관련 소스 일부는 남아 있습니다. 현재 개발자 대시보드의 주요 화면은 위 경로를 기준으로 구성되며, 기존 채용·주식 화면 URL은 새 화면으로 리다이렉트됩니다.

## 로컬 실행

### 1. 설치 및 데모 확인

Node.js 20 이상과 npm을 준비합니다. GitHub API 호출에는 Node.js 내장 `fetch`를 사용합니다.

```bash
git clone https://github.com/wellwellgood/FrontReact.git
cd FrontReact
npm install
npm start
```

[로컬 데모](http://localhost:3000/demo)에 접속하면 DB나 GitHub 설정 없이 UI를 확인할 수 있습니다. 실제 로그인과 계정 연동에는 아래 백엔드 설정이 필요합니다.

### 2. 백엔드 환경변수

`src/serverF/.env`를 생성합니다. 아래 값은 예시이며 실제 접속 정보와 별도로 생성한 비밀값으로 바꿔야 합니다.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=replace_with_a_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_random_secret
NODE_ENV=development
PORT=10000
FRONTEND_URL=http://localhost:3000

GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/github/callback
GITHUB_TOKEN_ENCRYPTION_KEY=your_base64_encoded_32_byte_key
```

비밀값 생성 예시입니다. JWT 비밀값은 각각 별도로 생성하고, 토큰 암호화 키는 아래 명령의 결과를 사용합니다.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

- 환경변수 파일은 Git에 커밋하지 않습니다.
- GitHub Client Secret과 암호화 키는 서버에만 저장합니다. `REACT_APP_` 변수에 넣지 않습니다.
- 암호화 키를 변경하면 저장된 GitHub 토큰을 해독할 수 없으므로 재연결이 필요합니다.
- GitHub 설정은 Git에서 제외된 `src/serverF/.env.github.local`로 분리할 수도 있습니다. 기본 환경변수와 중복되면 이미 설정된 값이 우선합니다.
- DB 계정에는 테이블 생성·변경 권한이 필요합니다. 시작 시 `users`, `github_connections`, `github_oauth_states`를 초기화합니다.

### 3. GitHub OAuth App 등록

[GitHub OAuth App 등록](https://github.com/settings/applications/new)에서 앱을 생성합니다. 현재 구현은 **OAuth App** 기준입니다.

- **Application name**: Dev Dashboard Local
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/github/callback`

발급된 Client ID와 Client Secret을 백엔드 환경변수에 입력합니다. 웹훅과 Device Flow는 필요하지 않습니다. 로컬과 배포 환경은 OAuth App을 분리해 관리하는 것을 권장합니다.

`GITHUB_REDIRECT_URI`와 GitHub에 등록한 콜백 주소는 일치해야 합니다. 로그인부터 콜백까지 `localhost`와 `127.0.0.1`을 섞어 사용하지 않습니다.

### 4. 백엔드 실행

새 터미널에서 실행합니다.

```bash
cd FrontReact/src/serverF
npm install
npm start
```

- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:10000`

API 주소를 변경하려면 프론트엔드 루트 `.env.local`에 다음을 설정하고 개발 서버를 다시 시작합니다. 주소 끝에 `/api`는 붙이지 않습니다.

```dotenv
REACT_APP_API_URL=http://localhost:10000
```

기존 채팅·파일 업로드 API는 별도 저장소 설정과 테이블이 필요할 수 있으며, 위 설정은 개발자 대시보드의 기본 실행을 위한 구성입니다.

## 주요 경로

### 화면

- `/dashboard`: 종합 현황
- `/projects`: 공개 저장소 및 즐겨찾기
- `/issues`: 작성한 이슈·PR
- `/activity`: 최근 활동
- `/settings`, `/account/profile`, `/account/notifications`: 계정 설정
- `/github/callback`: GitHub 승인 결과 처리
- `/demo`, `/demo/projects`, `/demo/issues`, `/demo/activity`: 예시 데이터 화면

### GitHub API

아래 API는 사이트 로그인 JWT를 `Authorization: Bearer <token>` 헤더로 전달해야 합니다.

```text
GET    /api/github/status          연결 상태 확인
POST   /api/github/connect         GitHub 승인 URL 생성
POST   /api/github/callback        승인 코드 교환 및 계정 연결
GET    /api/github/dashboard       사용자별 대시보드 조회
PUT    /api/github/favorites/:id   즐겨찾기 변경 ({ "enabled": true | false })
DELETE /api/github/connection      사이트 내 연결 정보 삭제
```

## 사용자별 데이터 처리

- 서버는 검증된 JWT의 사용자 ID를 기준으로 데이터를 조회합니다.
- GitHub 접근 토큰은 AES-256-GCM으로 암호화하여 DB에 저장합니다.
- OAuth state는 사이트 사용자에 연결되며 10분 후 만료되고 한 번만 사용할 수 있습니다.
- OAuth 승인 과정에 PKCE를 적용합니다.
- 대시보드 결과는 사용자별로 60초간 메모리 캐시합니다.
- 연결 해제 시 사이트의 토큰·즐겨찾기·대기 중인 연결 요청을 삭제합니다. GitHub 자체의 앱 접근 승인은 GitHub 설정에서 별도로 철회할 수 있습니다.
- DB 연결 풀을 사용하며, 사용량을 소모하는 주기적인 DB 확인 요청은 실행하지 않습니다. 유휴 DB의 첫 요청에는 재가동 지연이 발생할 수 있습니다.

## 빌드 및 테스트

프로젝트 루트에서 실행합니다.

```bash
npm run build
node --test src/serverF/tests/github.test.js
```

GitHub 테스트는 암호화·변조 검출, 두 테스트 사용자의 OAuth state·토큰·조회 데이터·즐겨찾기 분리, state 재사용 거부, 공개 저장소 필터링과 부분 조회 실패 처리를 검증합니다.

이 테스트는 가짜 저장소와 GitHub 응답을 사용하는 자동 테스트입니다. 실제 DB 연결 및 실제 GitHub 계정의 OAuth 승인 검증을 대신하지 않습니다.

## 배포

### Netlify

- 프로젝트 루트에서 빌드하고 `build` 폴더를 배포합니다.
- 저장소의 `netlify.toml`에 빌드와 SPA 리다이렉트가 설정되어 있습니다.
- `REACT_APP_API_URL`을 실제 백엔드 주소로 설정합니다.

### Render

- Root Directory: `src/serverF`
- Build Command: `npm install`
- Start Command: `npm start`
- 서버 환경변수에 DB·JWT·GitHub 설정을 입력하고 `NODE_ENV=production`으로 설정합니다.
- `FRONTEND_URL`에는 실제 프론트엔드 Origin을 설정합니다. 여러 주소는 `FRONTEND_URLS`에 쉼표로 구분할 수 있습니다.
- `GITHUB_REDIRECT_URI`와 OAuth App의 콜백을 실제 프론트엔드의 `/github/callback` 주소로 맞춥니다.

환경변수를 바꾸는 것만으로 수정 코드가 배포되지는 않습니다. 저장소에 코드를 반영하고 프론트엔드와 백엔드를 각각 재배포해야 합니다.

### 배포 주소 및 상태

- 프론트엔드: [dashboardkky.netlify.app](https://dashboardkky.netlify.app)
- API 서버: [react-server-wmqa.onrender.com](https://react-server-wmqa.onrender.com)

**2026-10-01 확인 기준:** Render 서버는 반복된 실행 오류로 자동 중지된 상태이며 HTTP 503을 반환했습니다. 새 DB 연결, 서버 재개, 최신 코드 배포 및 실제 GitHub OAuth 검증이 완료된 상태로 보장되지 않습니다. 배포 상태와 관계없이 로컬 `/demo`에서 화면을 확인할 수 있습니다.

## 현재 범위와 개선 과제

- 비공개 저장소와 조직 소유 저장소는 조회 대상에서 제외합니다.
- 저장소는 갱신순 최대 500개, 작성한 열린 공개 이슈·PR은 각각 최대 30개, 공개 이벤트는 최근 최대 30개를 조회합니다.
- 언어 분포는 **주요 언어별 저장소 개수**이며, 코드 줄 수나 바이트 비율이 아닙니다.
- 공개 이벤트 수는 전체 커밋 수나 GitHub 기여도 잔디와 다릅니다.
- 토큰 자동 갱신과 알림 발송은 구현하지 않았습니다.
- 기존 휴대전화 인증은 예시 구현이며 실제 SMS 인증이 아닙니다. 정식 운영 전 인증·비밀번호 복구 흐름 점검이 필요합니다.
- 계정 설정의 브라우저 설정 초기화는 서버 회원 탈퇴가 아닙니다.
- 새 DB에는 기존 회원 데이터가 자동 이전되지 않습니다. 이전 DB를 보존하고 별도로 이관해야 합니다.

## 문제 해결

- **CORS 오류와 함께 502/503 발생**: 서버 실행 여부와 Render 로그부터 확인합니다. 서버가 중지되면 플랫폼 오류 응답에 CORS 헤더가 없어 CORS 문제처럼 보일 수 있습니다.
- **DB 오류 `53000`과 quota 안내**: DB 제공 서비스의 사용량과 프로젝트 상태를 확인합니다.
- **GitHub 연결 설정 필요 안내**: 서버의 GitHub 환경변수와 암호화 키 형식을 확인합니다.
- **콜백 오류**: OAuth App 등록 주소, `GITHUB_REDIRECT_URI`, 실제 접속 호스트가 일치하는지 확인합니다.
- **새 DB에서 기존 계정 로그인 실패**: 회원 데이터 이관 여부를 확인합니다.

## 개발자

김기윤 · [GitHub @wellwellgood](https://github.com/wellwellgood)
