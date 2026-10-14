import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: 'http://localhost:10000/users', // 💡 서버 주소
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
});

axiosInstance.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
    if (token) {
    // eslint-disable-next-line no-template-curly-in-string
    config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;