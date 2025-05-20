/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import officeFunctionsPlugin from "./vite-plugin-office-functions";
import tailwindcss from "@tailwindcss/vite";
import devCerts from "office-addin-dev-certs";
import path from "path";

const httpsOptions = await devCerts.getHttpsServerOptions();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    officeFunctionsPlugin({
      input: "src/functions/functions.ts",
      outputJsName: "functions.js",
      outputJsonName: "functions.json",
    }),
  ],
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    https: {
      ca: httpsOptions.ca,
      key: httpsOptions.key,
      cert: httpsOptions.cert,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/testing/setup-tests.ts",
    exclude: ["**/node_modules/**", "**/e2e/**"],
    coverage: {
      include: ["src/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
