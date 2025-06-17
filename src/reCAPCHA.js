// reCAPCHA.js - 수정된 최종본 (RecaptchaVerifier 인자 순서 고정)
import { RecaptchaVerifier } from "firebase/auth";

let recaptchaInstance = null;

export const generateRecaptcha = (auth, containerId = "recaptcha-container", size = "invisible") => {
  if (!auth) {
    console.error("❌ auth 인스턴스가 undefined입니다. Recaptcha 생성 실패");
    return null;
  }

  if (recaptchaInstance) {
    console.log("ℹ️ RecaptchaVerifier 이미 존재함. 재사용");
    return recaptchaInstance;
  }

  try {
    recaptchaInstance = new RecaptchaVerifier(
      containerId,
      {
        size,
        callback: () => {
          console.log("✅ reCAPTCHA verified");
        },
        "expired-callback": () => {
          console.log("⚠️ reCAPTCHA expired");
        }
      },
      auth // ✅ 세 번째 인자로 정확히 전달
    );

    console.log("✅ RecaptchaVerifier 초기화 완료");
    return recaptchaInstance;
  } catch (error) {
    console.error("❌ RecaptchaVerifier 생성 실패:", error);
    return null;
  }
};

export const clearRecaptcha = () => {
  if (recaptchaInstance) {
    try {
      recaptchaInstance.clear();
      console.log("🧹 RecaptchaVerifier 제거 완료");
    } catch (error) {
      console.warn("⚠️ RecaptchaVerifier 제거 중 오류:", error);
    }
    recaptchaInstance = null;
  }
};
