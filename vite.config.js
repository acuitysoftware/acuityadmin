import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = new URL(
    env.VITE_BASE_URL || "https://acuitynew.acuitysoftware.co.in/"
  ).origin;

  return {
    // Use the root for Vite's dev server; production assets are deployed under /admin.
    base: command === "serve" ? "/" : "/admin/",
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
