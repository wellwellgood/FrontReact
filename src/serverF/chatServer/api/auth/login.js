import axios from "axios";

// 로그인 요청을 여러 개의 API URL로 시도하는 함수
const loginWithBackupUrls = async (credentials) => {

  const apiUrls = [
    "http://localhost:10000/users/login",
    "http://localhost:10000/login",
    "http://localhost:10000/auth/login",
    "https://kkywebapp.netlify.app/"
  ];

  localStorage.removeItem("SuccessfulLoginUrl");

  console.log("📌 로그인 시도:", credentials);

  if (!credentials.username || !credentials.password) {
    throw new Error("⚠️ 아이디와 비밀번호를 모두 입력해주세요.");
  }

  let lastError = null;

  for (const url of apiUrls) {
    try {
      console.log(`🔍 API 요청 시도: ${url}`);

      const response = await axios.post(url, credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log(`✅ 로그인 성공 (${url}):`, response.data);

      // 성공한 URL을 로컬 스토리지에 저장
      localStorage.setItem("successfulLoginUrl", url);

      // 토큰 저장
      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error(`❌ 로그인 실패 (${url}):`, error.response?.data || error.message);
      lastError = error;
    }
  }

  // 모든 URL 시도 실패 시
  throw new Error(lastError?.response?.data?.message || "❌ 서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.");
};

// 성공했던 URL을 우선 시도하는 함수
export const loginUser = async (credentials) => {
  const successUrl = localStorage.getItem("successfulLoginUrl");

  if (successUrl) {
    try {
      console.log(`🔍 이전 성공 URL로 로그인 시도: ${successUrl}`);

      const response = await axios.post(successUrl, credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("✅ 로그인 성공:", response.data);

      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("❌ 이전 URL 로그인 실패:", error.response?.data || error.message);
      return loginWithBackupUrls(credentials);
    }
  } else {
    return loginWithBackupUrls(credentials);
  }
};