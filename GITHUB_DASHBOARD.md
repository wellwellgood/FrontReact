# GitHub 개발자 프로젝트 대시보드

기존 로그인·회원가입·프로필·계정 화면과 파란색 카드 레이아웃을 유지하면서 주식 화면을 GitHub 프로젝트 화면으로 전환했습니다.

## 화면과 기능
- `/dashboard`: 사용자별 공개 프로젝트 수, 작성한 열린 이슈·PR, 받은 스타, 프로젝트 언어 분포, 최근 공개 활동
- `/projects`: 본인 소유 공개 저장소 검색, 주요 언어 필터, 사용자별 서버 저장 즐겨찾기
- `/issues`: 작성한 공개 이슈와 PR, GitHub 원문 링크
- `/activity`: 최근 공개 이벤트
- `/github/callback`: OAuth 승인 결과 처리
- `/demo`: 인증·서버 없이 확인하는 명시적 예시 데이터 화면. 실제 연결 화면에는 예시 데이터를 넣지 않습니다.
- 기존 주식·채용 URL은 새 개발자 화면으로 이동합니다.

GitHub 연결은 기존 사이트 로그인과 별개입니다. 로그인 → GitHub 연결 → 승인 → 본인 데이터 조회 순서입니다. 비공개 저장소와 조직 소유 저장소는 이번 범위에서 제외했습니다. 프로젝트 언어 분포는 주요 언어별 저장소 개수이며 코드 비율이 아닙니다. 공개 이벤트는 커밋 총합이 아닙니다.

## GitHub OAuth App 등록
등록: https://github.com/settings/applications/new
GitHub App이 아니라 OAuth App을 사용합니다. 웹훅과 Device Flow는 필요하지 않습니다.
- Application name: Dev Dashboard
- Homepage URL: https://dashboardky.netlify.app
- Authorization callback URL: https://dashboardky.netlify.app/github/callback

실제 사용하는 Netlify 도메인이 다르면 홈페이지, 콜백, 서버 GITHUB_REDIRECT_URI와 CORS 허용 주소를 모두 같은 호스트로 맞추세요. `dashboardky`와 `dashboardkky`는 서로 다른 주소입니다.

## 서버 설정
Render의 기존 백엔드 서비스 Environment에 다음을 설정합니다.
- GITHUB_CLIENT_ID: OAuth App의 Client ID
- GITHUB_CLIENT_SECRET: OAuth App의 Client Secret
- GITHUB_REDIRECT_URI: https://dashboardky.netlify.app/github/callback
- GITHUB_TOKEN_ENCRYPTION_KEY: 32바이트 난수를 Base64로 인코딩한 값
- DATABASE_URL: 기존 PostgreSQL 주소 유지
- JWT_SECRET: 기존 로그인에서 토큰 발급에 쓰는 값 유지
- JWT_REFRESH_SECRET: 기존 로그인/갱신 설정 유지

암호화 키 생성 예시: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`
서버별로 한 번 생성해 안전하게 보관하고 재배포마다 바꾸지 마세요. 변경하면 기존 연결 토큰을 해독할 수 없어 재연결이 필요합니다. 키와 시크릿은 프론트엔드 REACT_APP_ 변수에 넣지 않습니다.
로컬에서는 Git 제외 파일 `src/serverF/.env.github.local`을 사용합니다. 로컬 암호화 키는 생성되어 있으며 클라이언트 ID·시크릿은 비워 두었습니다. 예시 파일은 `.env.github.example`입니다.

## 실행·배포
1. 프론트 프로젝트에서 `npm start`. 데모는 `/demo`로 열기.
2. 백엔드 `src/serverF`에서 기존 환경변수 설정 후 `npm start`.
3. 서버 시작 시 users 테이블 확인 후 github_connections와 github_oauth_states 테이블을 생성합니다. DB 계정에 테이블 생성 권한이 필요합니다.
4. 운영 서비스는 수정 코드를 저장소에 반영하고 Render와 Netlify를 모두 재배포해야 합니다. 환경변수 설정만으로 이전 배포 코드가 바뀌지는 않습니다.
5. 로컬 OAuth 테스트는 별도 앱을 쓰거나 콜백 URL을 `http://localhost:3000/github/callback`으로 맞추고 같은 호스트로 로그인하세요. `127.0.0.1`과 `localhost`의 로그인 저장소는 다릅니다.

## 사용자별 분리와 연결 해제
모든 API는 기존 로그인 JWT의 user.id로 소유자를 결정합니다. 클라이언트가 보낸 사용자 ID를 신뢰하지 않습니다. 토큰은 AES-256-GCM으로 암호화하여 PostgreSQL에 저장합니다. OAuth state는 사용자에 묶이고 10분 만료·일회용이며 PKCE를 사용합니다. 같은 GitHub 계정은 한 사이트 계정에만 연결됩니다.
연결 해제는 사이트의 토큰·즐겨찾기·대기 중 연결 요청을 지웁니다. GitHub의 앱 승인은 GitHub 설정에서 별도로 철회할 수 있습니다. 토큰 만료·철회 시 다시 연결하도록 안내하며 자동 갱신은 구현하지 않았습니다.

## 조회 범위와 오류
저장소는 갱신순 최대 500개, 이슈·PR은 작성자 기준 열린 공개 항목 각 30개, 이벤트는 최근 30개입니다. 범위를 초과하면 화면에서 제한을 표시합니다. 결과는 사용자별 60초 캐시입니다. 일부 API 실패는 해당 영역의 조회 실패로 표시하며 가짜 0건으로 대체하지 않습니다.
프로필·알림 선호는 사용자별 브라우저 저장입니다. 자동 알림 발송은 미구현입니다. 기존의 실제로 서버 계정을 지우지 않던 ‘계정 삭제’ 버튼은 ‘브라우저 설정 초기화’로 정확히 표시했습니다.

## 검증 및 남은 설정
- 프론트엔드 빌드 성공
- 두 테스트 사용자의 OAuth state·토큰·조회 데이터·즐겨찾기 분리 검증
- 토큰 암호화·변조 검출, 인증 요청 재사용 거부, 만료 처리 검증
- 실제 GitHub OAuth 계정 두 개로의 연동 검증은 Client Secret 및 서버 설정 완료 후 필요
- 로컬 DB 연결 점검은 PostgreSQL 오류 53000으로 진행하지 못했습니다. 기존 DB 데이터를 변경하지 않았으며 운영 DB 상태/리소스 확인이 필요합니다.
- KIS 연결은 메인 서버에서 해제되어 더 이상 호출하지 않습니다. 이전 소스와 저장 데이터는 삭제하지 않았습니다.

공식 문서: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
