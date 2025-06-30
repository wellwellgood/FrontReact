# 💬 KKY Dashboard – 실시간 채팅 대시보드

React + Node.js + Firebase 기반의 **실시간 채팅 및 파일 공유 대시보드**입니다.  
팀 협업을 위한 기능을 중심으로, 사용자 친화적인 UI와 다양한 설정 기능을 제공합니다.

## 🔗 배포 링크
- 🖥️ 프론트엔드: [https://kkydashboard.netlify.app](https://kkydashboard.netlify.app)
- 🛠️ 백엔드(API): [https://react-server-wmqa.onrender.com](https://react-server-wmqa.onrender.com)

## 📸 스크린샷
> ※ 아래는 실제 UI 예시입니다.

| 채팅 UI | 설정 페이지 |
|--------|-------------|
| ![chat](./screenshots/chat.png) | ![settings](./screenshots/settings.png) |

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
npm install
node server.mjs
\`\`\`

## 🧪 테스트 계정
\`\`\`
ID: testuser
PW: 1234
\`\`\`

## 🧑‍💻 개발자
| 이름 | 포지션 | GitHub |
|------|--------|--------|
| 김기윤 | 웹 기획 및 제작 견습생 | [@wellwellgood](https://github.com/wellwellgood) |

## 📄 라이선스
MIT License