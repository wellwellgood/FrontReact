// middlewares/cors.js
const cors = require("cors");

const allowedOrigins = [{
  origin: [
    "https://myappboard.netlify.app",
    "http://localhost:3000",
    "http://localhost:4000",
    "https://react-server-wmqa.onrender.com"
  ],
  credentials: true
}];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🛰️ 요청 origin:", origin); // 추가
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

module.exports = cors({
  origin: true, // origin: "*" 이 아님. 이건 credentials와 같이 쓸 수 있음
  credentials: true,
});
