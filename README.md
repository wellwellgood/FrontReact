# 💬 KKY Dashboard – 실시간 채팅 대시보드

React + Node.js + Firebase 기반의 **실시간 채팅 및 파일 공유 대시보드**입니다.  
팀 협업을 위한 기능을 중심으로, 사용자 친화적인 UI와 다양한 설정 기능을 제공합니다.

# Free Deploy

비용 부담 없이도 최대한 실제 서비스에 가깝게 구축하고자 했고, Neon의 Free 플랜의 슬립모드 특성을 고려해 UX 최적화를 시도했습니다. 추후 확장 시 유료 플랜도 고려해봤습니다

## 🔗 배포 링크
- 🖥️ 프론트엔드: [https://kkydashboard.netlify.app](https://kkydashboard.netlify.app)
- 🛠️ 백엔드(API): [https://react-server-wmqa.onrender.com](https://react-server-wmqa.onrender.com)

## ✨ 주요 기능
- 🧑‍💻 로그인 / 회원가입 (sessionStorage 기반)
- 💬 실시간 채팅 (Socket.IO)
- 📎 파일 업로드 & 다운로드 (Firebase Storage)
- 🛠️ 프로필 / 테마 / 알림 설정
- 🔔 채팅 알림 (브라우저 푸시 or 토스트)
- 🧾 메시지 읽음 처리
- 🌙 고대비 테마 모드

## 🧩 기술 스택

### Frontend
- React (Hooks, Router)
- CSS Module
- Axios
- Netlify 배포

### Backend
- Node.js + Express
- PostgreSQL (Neon)
- Firebase Admin SDK (파일 업로드 관리)
- Socket.IO
- Render 배포

### 기타
- localStorage 기반 사용자 설정 저장
- dotenv + .env 환경변수 구성

## 📁 프로젝트 구조

\`\`\`
📦 root
├─ client/             # React 프론트엔드
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  └─ App.jsx
├─ serverF/            # 백엔드(Node.js + Express)
│  ├─ routes/
│  ├─ middlewares/
│  ├─ server.mjs
│  └─ DB.js
\`\`\`

## ⚙️ 로컬 실행 방법

### ✅ 환경 변수 설정

`.env` 파일 생성 (serverF 폴더에):

\`\`\`env
DATABASE_URL=your_postgresql_url
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
\`\`\`

### ▶ 실행 절차

\`\`\`bash
# 1. 저장소 클론
git clone https://github.com/yourname/kkydashboard.git
cd kkydashboard

# 2. 클라이언트 실행
cd client
npm install
npm start

# 3. 서버 실행
cd ../serverF
프론트 실행 : npm install
사바 실행 : (cd src/serverF) node server.mjs
\`\`\`

## 🧑‍💻 개발자
| 이름 | 포지션 | GitHub |
|------|--------|--------|
| 김기윤 | 웹 기획 및 제작 견습생 | [@wellwellgood](https://github.com/wellwellgood) |

## 📄 라이선스
MIT License

## 아쉬운 점이나 수정,필요한 점
아직은 component를 이용한 작은 프로젝트지만, 앞으로 코딩을 하다 보면 다뤄야 할 것들이 더 많아질 거다. 우선 component 안에서 사용하는 hooks들이나 JSX 등 아직 완전히 익숙하지는 않지만, 사용해야 하는 것들이 너무 많다. 이런 복잡함을 줄이려면 기본적으로 더 간결하고 심플한 템플릿이 갖춰져 있어야 한다.

또, 지금은 작은 프로젝트라 useState 정도면 되지만, 규모가 커지면 Redux, Zustand 등 여러 가지 상태 관리 라이브러리를 사용해야 할 일이 생긴다. 이런 점을 보완하려면 좀 더 강력하고 직관적인 내장 상태 관리 기능이 React 자체에 있었으면 좋겠다. 그런 환경에 익숙해지는 것도 앞으로 필요할 것 같다.

React 개발 시 복잡한 상태 관리와 템플릿 구조의 간소화를 필요로 하며, 향후 프로젝트 규모 확대에 대비한 내장 상태 관리 기능에 대한 이해도와 활용 능력을 키울 계획을 만들어야 한다.


## 느낀점이나 마지막으로 할 말
이번 프로젝트는 React를 처음 사용해본 동시에, React를 이용한 첫 프로젝트였다. 처음 사용할 때를 떠올려보면, 모든 것이 낯설고 어려웠다. 그래서 무작정 검색하면서 component라는 개념을 배우고, 이를 직접 사용해보려는 목적으로 시작했었다.

하지만 프로젝트를 진행하면서 점점 흥미를 느끼기 시작했다. 기존 퍼블리셔 마인드에서 벗어나, 내가 만든 component를 import해서 가져오고, 변수처럼 선언해 사용하는 방식이 JavaScript를 쓸 때의 불편함을 해소해주는 부분이 가장 재미있었다.

사실 별거 아닐 수 있지만, 나는 나에게 후한 점수를 주고 싶다. 이유는, 나는 원래 무언가를 배우는 걸 꺼려하는 성격인데, React를 시작할 때도 금방 포기하지 않을까 생각했었다. 그런데 지금 프로젝트 완성도를 보면, 그런 마음가짐으로 시작한 것 치고는 꽤 많은 걸 만들었고 실행까지 하고 있다.

물론 다른 개발자들이 보면 별거 아닐 수도 있다. 하지만 지금 이 순간, 나 스스로는 후한 점수를 줄 만큼 성장했다고 생각한다.