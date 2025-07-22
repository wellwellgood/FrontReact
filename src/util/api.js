import axios from "axios";

let BASE_URL = process.env.REACT_APP_API || "http://localhost:10000";

if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  BASE_URL = "http://localhost:10000/api";
} else {
  BASE_URL = "https://react-server-wmqa.onrender.com/api"; // ✅ 🔥 /api 붙임
}

console.log("✅ 최종 BASE_URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
