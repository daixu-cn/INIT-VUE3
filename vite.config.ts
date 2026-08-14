import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vite"

import { build, css, plugins } from "./config/index.ts"

export default defineConfig(config => {
  // const PROD = config.mode === "production"
  const env = loadEnv(config.mode, process.cwd(), "")

  return {
    base: env.VITE_APP_BASE_URL,
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    oxc: {},
    plugins: plugins(config),
    css: css(config),
    build: build(config),
    server: { open: true, host: "0.0.0.0", port: Number(env.VITE_APP_PORT) },
    preview: { host: "0.0.0.0", port: Number(env.VITE_APP_PORT) },
  }
})
