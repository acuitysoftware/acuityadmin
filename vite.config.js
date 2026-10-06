import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = new URL(
    env.VITE_BASE_URL || "https://acuitynew.acuitysoftware.co.in/api"
  ).origin;

  return {
    // Relative base path ensures assets are loaded correctly whether hosted at domain root or in /admin/ subfolder
    base: "./",
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
