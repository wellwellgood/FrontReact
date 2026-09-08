import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server : "https://kkyemailjs.netlify.app/",
  plugins: [react()],
  server: {
    port: 5173, // 필요하면 포트 변경
  },
});