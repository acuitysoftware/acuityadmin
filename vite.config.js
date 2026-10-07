import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = new URL(
    env.VITE_BASE_URL || "https://acuitynew.acuitysoftware.co.in/"
  ).origin;

  return {
    // The admin app is deployed under /admin, including its assets.
    base: "/admin/",
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
