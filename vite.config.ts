import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import ElementPlus from "unplugin-element-plus/vite"
import AutoImport from "unplugin-auto-import/vite"
import progress from "vite-plugin-progress"
import { visualizer } from "rollup-plugin-visualizer"
import viteCompression from "vite-plugin-compression"
import { createHtmlPlugin } from "vite-plugin-html"
import PostcssPresetEnv from "postcss-preset-env"
import legacy from "@vitejs/plugin-legacy"
import { injectScripts, injectLinks } from "./src/config/inject-tags"

export default defineConfig(({ mode }) => {
  const PROD = mode === "production"
  const env = loadEnv(mode, process.cwd(), "")
  const scripts = injectScripts([env.VITE_ICON_ICONFONT])
  const links = injectLinks([
    { rel: "stylesheet", type: "text/css", href: "/src/assets/styles/css/loading.css" },
  ])

  return {
    base: env.VITE_APP_BASE_URL,
    plugins: [
      vue(),
      vueJsx(),
      progress(),
      legacy(),
      Components({
        dts: "./src/typings/components.d.ts",
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      }),
      AutoImport({ imports: ["vue"], dts: "./src/typings/auto-imports.d.ts" }),
      createHtmlPlugin({ minify: true, inject: { tags: [...scripts, ...links] } }),
      viteCompression({ threshold: 10240 }),
      visualizer({ filename: "statistic.html" }),
      ElementPlus({ useSource: true, defaultLocale: "zh-cn" }),
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    css: {
      postcss: { plugins: [PostcssPresetEnv()] },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/scss/base/_variables.scss" as *;
            @use "@/assets/styles/scss/base/_mixins.scss" as *;
            @use "@/assets/styles/scss/base/_tools.scss" as *;
            @use "@/assets/styles/scss/base/_z-index.scss" as *;
            @use "@/assets/styles/scss/vendors/element-plus-light.scss";
            @use "@/assets/styles/scss/vendors/element-plus-dark.scss";
          `,
        },
      },
    },
    server: { open: true, host: "0.0.0.0", port: 8080 },
    esbuild: { drop: PROD ? ["console", "debugger"] : undefined },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "js/[hash].js",
          entryFileNames: "js/[hash].js",
          assetFileNames: "assets/[ext]/[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor"
            }
          },
        },
      },
    },
  }
})
