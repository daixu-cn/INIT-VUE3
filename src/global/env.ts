export const SITE_TITLE = import.meta.env.VITE_APP_SITE_TITLE
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL
export const BASE_API = import.meta.env.VITE_APP_BASE_API
export const CLOUDFLARE_TURNSTILE_SITE_KEY = import.meta.env.VITE_APP_CLOUDFLARE_TURNSTILE_SITE_KEY

export const BRAND_ASSET_BASE_URL =
  import.meta.env.VITE_APP_BRAND_ASSET_BASE_URL || "https://media.yygo.tv/system/brand"
export const BRAND_WORDMARK_URL = `${BRAND_ASSET_BASE_URL}/branding.svg`
export const BRAND_LOGO_URL = `${BRAND_ASSET_BASE_URL}/logo.svg`
export const APP_STORE_URL = import.meta.env.VITE_APP_APP_STORE_URL || "https://apps.apple.com/"
export const GOOGLE_PLAY_URL =
  import.meta.env.VITE_APP_GOOGLE_PLAY_URL ||
  "https://play.google.com/store/apps/details?id=tv.yygo.echo"
