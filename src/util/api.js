import axios from "axios";

const configuredServer = process.env.REACT_APP_API_URL || process.env.REACT_APP_API;
const defaultServer =
  process.env.NODE_ENV === "development"
    ? "http://localhost:10000"
    : "https://react-server-wmqa.onrender.com";

const api = axios.create({
  baseURL: `${(configuredServer || defaultServer).replace(/\/$/, "")}/api`,
  withCredentials: true,
});

export default api;
