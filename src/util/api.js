import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:10000/api"
      : "https://react-server-wmqa.onrender.com/api",
  withCredentials: true,
});

export default api;