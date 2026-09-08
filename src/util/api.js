import axios from "axios";

const BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:10000/api"     // ✅ 개발
    : "https://react-server-wmqa.onrender.com/api"; // ✅ 배포

console.log("✅ 최종 BASE_URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
