interface ImportMetaEnv {
  /** App Store 下载地址 */
  readonly VITE_APP_APP_STORE_URL: string
  /** 预览端口 */
  readonly VITE_APP_PORT: string
  /** 站点标题 */
  readonly VITE_APP_SITE_TITLE: string
  /** 站点作者 */
  readonly VITE_APP_SITE_AUTHOR: string
  /** 站点关键词 */
  readonly VITE_APP_SITE_KEYWORDS: string
  /** 站点描述 */
  readonly VITE_APP_SITE_DESCRIPTION: string
  /** 公共基础路径 */
  readonly VITE_APP_BASE_URL: string
  /** 服务请求地址 */
  readonly VITE_APP_BASE_API: string
  /** R2 品牌资源目录 */
  readonly VITE_APP_BRAND_ASSET_BASE_URL: string
  /** Google Play 下载地址 */
  readonly VITE_APP_GOOGLE_PLAY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
