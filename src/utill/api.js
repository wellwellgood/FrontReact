import axios from "axios";

let BASE_URL = process.env.REACT_APP_API || "http://localhost:4000";

// ✅ 슬래시가 끝에 붙어있으면 제거
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

console.log("✅ 최종 BASE_URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;