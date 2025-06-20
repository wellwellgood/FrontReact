// middlewares/cors.js (ESM 버전)
import cors from "cors";

const allowedOrigins = [
  "https://myappboard.netlify.app",
  "http://localhost:3000",
  "http://localhost:4000",
  "https://react-server-wmqa.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🛰️ 요청 origin:", origin);
    const cleanOrigin = origin?.replace(/\/$/, '');
    if (!origin || allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("❌ 차단된 origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
