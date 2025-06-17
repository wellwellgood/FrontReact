const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // ✅ React 빌드된 파일을 로드
  const startUrl = `file://${path.join(__dirname, "build/index.html")}`;
  mainWindow.loadURL(startUrl);
});