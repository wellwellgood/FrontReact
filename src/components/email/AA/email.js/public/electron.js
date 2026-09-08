const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // ✅ Vite 개발 서버 또는 빌드된 파일을 로드
  const startUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:5173"  // ✅ Vite 개발 서버
    : `file://${path.join(__dirname, "../dist/index.html")}`;  // ✅ 빌드된 파일

  mainWindow.loadURL(startUrl);
});