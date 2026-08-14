import type { ConfigEnv, PluginOption } from "vite"

import tailwindcss from "@tailwindcss/vite"
import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import { visualizer } from "rollup-plugin-visualizer"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import viteCompression from "vite-plugin-compression"
import { createHtmlPlugin } from "vite-plugin-html"
import progress from "vite-plugin-progress"
import vuetify from "vite-plugin-vuetify"

import { injectLinks, injectScripts } from "../inject-tags.ts"
import version from "./version.ts"

export default function plugins(_config: ConfigEnv): PluginOption[] {
  const scripts = injectScripts([])
  const links = injectLinks([
    {
      rel: "stylesheet",
      type: "text/css",
      href: "/src/assets/styles/css/vendors/app-load-loading.css",
    },
  ])

  return [
    vue(),
    progress(),
    legacy(),
    Components({
      dts: "./src/typings/components.d.ts",
      globs: ["src/components/**/*.vue"],
    }),
    AutoImport({ imports: ["vue"], dts: "./src/typings/auto-imports.d.ts" }),
    vuetify({ autoImport: true }),
    createHtmlPlugin({
      minify: true,
      entry: "src/main.ts",
      inject: { tags: [...scripts, ...links] },
    }),
    viteCompression({ threshold: 10240 }),
    visualizer({ filename: "statistic.html" }),
    tailwindcss({ optimize: true }),
    version(),
  ]
}
