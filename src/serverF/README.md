# GITERVIEW Backend

GITERVIEW의 Express + PostgreSQL 백엔드 서버입니다.

## 네이버 로그인 환경변수

네이버 Client Secret은 프론트엔드에 넣지 않고 서버 환경변수로만 관리합니다.

```env
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=https://gitterview.netlify.app/naver/callback
```

로컬 테스트에서는 `NAVER_REDIRECT_URI=http://localhost:3000/naver/callback`로
설정하고, 네이버 개발자센터에도 같은 주소를 Callback URL로 등록해야 합니다.
