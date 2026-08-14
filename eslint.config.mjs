import skipFormatting from "@vue/eslint-config-prettier/skip-formatting"
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"
import perfectionist from "eslint-plugin-perfectionist"
import pluginVue from "eslint-plugin-vue"

export default defineConfigWithVueTs([
  { name: "app/files-to-lint", files: ["**/*.{ts,mts,tsx,vue}"] },
  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "src/typings/**"],
  },
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  skipFormatting,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": "warn",
      "perfectionist/sort-exports": "warn",
      "no-var": "error", // 要求使用 let 或 const 而不是 var
      "no-useless-escape": "off", // 禁止不必要的转义字符
      "vue/multi-word-component-names": "off", // 要求组件名称始终为 “-” 链接的单词
      "no-async-promise-executor": "off", // 禁止使用 async/await 的方式处理 Promise
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 禁止未使用的变量
      "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型
      "@typescript-eslint/no-unsafe-function-type": "off", // 禁止使用不安全的函数类型
      "@typescript-eslint/ban-ts-comment": "off", // 禁用使用 @ts-comment 标记忽略特定的 TypeScript 错误
    },
  },
])
