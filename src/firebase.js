import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// 개발 모드에서만 디버그 토큰 사용
if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
  // 브라우저 콘솔에서 디버그 토큰을 받기 위한 설정
  window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Firebase 구성 객체
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 환경 변수 디버깅
const logEnvVars = () => {
  const envVars = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? "설정됨" : "없음",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? "설정됨" : "없음",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? "설정됨" : "없음",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? "설정됨" : "없음",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? "설정됨" : "없음",
    appId: process.env.REACT_APP_FIREBASE_APP_ID ? "설정됨" : "없음",
    recaptchaKey: process.env.REACT_APP_RECAPTCHA_KEY ? "설정됨" : "없음"
  };
  
  console.log("💡 Firebase 환경 변수 상태:", envVars);
  
  // 필수 환경 변수 체크
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => value === "없음")
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error(`❌ 누락된 환경 변수: ${missingVars.join(", ")}`);
    console.warn("⚠️ .env 파일이 제대로 설정되었는지 확인하세요.");
  }
};

// Firebase 인스턴스
let app;
let auth;
let db;
let appCheck;

export const initializeFirebase = () => {
  try {
    // 환경 변수 로깅
    logEnvVars();
    
    // 필수 설정 확인
    if (!process.env.REACT_APP_FIREBASE_API_KEY) {
      console.error("❌ Firebase API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
      return { error: "Firebase 설정 오류" };
    }
    
    // Firebase 앱 초기화 (한 번만)
    if (!app) {
      try {
        app = initializeApp(firebaseConfig);
        console.log("✅ Firebase 앱 초기화 성공");
      } catch (appError) {
        console.error("❌ Firebase 앱 초기화 실패:", appError);
        return { error: "Firebase 앱 초기화 실패" };
      }
    }
    
    // Auth 초기화 (한 번만)
    if (!auth) {
      try {
        auth = getAuth(app);
        console.log("✅ Firebase Auth 초기화 성공");
      } catch (authError) {
        console.error("❌ Firebase Auth 초기화 실패:", authError);
        return { error: "인증 서비스 초기화 실패" };
      }
    }
    
    // Firestore 초기화 (한 번만)
    if (!db) {
      try {
        db = getFirestore(app);
        console.log("✅ Firestore 초기화 성공");
      } catch (dbError) {
        console.error("❌ Firestore 초기화 실패:", dbError);
        // Firestore 오류는 치명적이지 않으므로 계속 진행
      }
    }
    
    // AppCheck 초기화 시도 - 선택적으로 비활성화 가능
    const disableAppCheck = process.env.REACT_APP_DISABLE_APPCHECK === 'true';
    
    if (!appCheck && !disableAppCheck) {
      const siteKey = process.env.REACT_APP_RECAPTCHA_KEY;
      
      if (!siteKey) {
        console.warn("⚠️ RECAPTCHA 사이트 키가 설정되지 않았습니다. AppCheck를 건너뜁니다.");
      } else {
        try {
          // AppCheck 초기화 전에 콘솔에서 디버그 토큰을 확인할 수 있도록 로깅
          if (process.env.NODE_ENV === 'development') {
            console.log("🔑 AppCheck 디버그 모드:", !!window.self.FIREBASE_APPCHECK_DEBUG_TOKEN);
          }
          
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(siteKey),
            isTokenAutoRefreshEnabled: true,
          });
          console.log("✅ AppCheck 초기화 성공");
        } catch (appCheckError) {
          console.warn("⚠️ AppCheck 초기화 실패:", appCheckError);
          console.log("🔄 인증은 AppCheck 없이 계속 진행됩니다");
          // AppCheck 오류는 치명적이지 않으므로 계속 진행
        }
      }
    } else if (disableAppCheck) {
      console.log("🔒 AppCheck가 명시적으로 비활성화되었습니다");
    }
    
    return { app, auth, db, appCheck };
  } catch (error) {
    console.error("❌ Firebase 초기화 중 알 수 없는 오류:", error);
    return { error: "Firebase 초기화 실패" };
  }
};

// Auth 가져오기
export const getFirebaseAuth = () => {
  if (!auth) {
    console.warn("⚠️ Firebase Auth가 초기화되지 않았습니다. 먼저 initializeFirebase를 호출하세요.");
    // 초기화 시도
    const { auth: newAuth, error } = initializeFirebase();
    if (error) {
      console.error("❌ Auth 가져오기 실패:", error);
      return null;
    }
    return newAuth;
  }
  return auth;
};