import axios from "axios";

let BASE_URL = process.env.REACT_APP_API || "http://localhost:4000";

if (!BASE_URL) {
  BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:10000"
      : "https://react-server-wmqa.onrender.com";
}

console.log("✅ 최종 BASE_URL:", BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://react-server-wmqa.onrender.com/api",
  withCredentials: true,
});

export default api;
