/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ICON_PREFIX: string
  readonly VITE_ICON_ICONFONT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
