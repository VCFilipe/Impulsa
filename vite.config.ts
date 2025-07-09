import path from "path";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: "carvalho-sistemas",
        project: "impulsa",
        telemetry: false,
      }),
    ],
    define: {
      GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
