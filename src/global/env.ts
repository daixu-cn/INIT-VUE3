function requiredEnvironmentValue(key: string, rawValue: string | undefined) {
  const value = rawValue?.trim()
  if (!value) throw new Error(`Missing required environment value: ${key}`)
  return value
}

export const SITE_TITLE = requiredEnvironmentValue(
  "VITE_APP_SITE_TITLE",
  import.meta.env.VITE_APP_SITE_TITLE,
)
export const BASE_URL = requiredEnvironmentValue(
  "VITE_APP_BASE_URL",
  import.meta.env.VITE_APP_BASE_URL,
)
export const BASE_API = requiredEnvironmentValue(
  "VITE_APP_BASE_API",
  import.meta.env.VITE_APP_BASE_API,
)
export const BRAND_ASSET_BASE_URL = requiredEnvironmentValue(
  "VITE_APP_BRAND_ASSET_BASE_URL",
  import.meta.env.VITE_APP_BRAND_ASSET_BASE_URL,
)
export const BRAND_WORDMARK_URL = `${BRAND_ASSET_BASE_URL}/branding.svg`
export const BRAND_LOGO_URL = `${BRAND_ASSET_BASE_URL}/logo.svg`
export const APP_STORE_URL = requiredEnvironmentValue(
  "VITE_APP_APP_STORE_URL",
  import.meta.env.VITE_APP_APP_STORE_URL,
)
export const GOOGLE_PLAY_URL = requiredEnvironmentValue(
  "VITE_APP_GOOGLE_PLAY_URL",
  import.meta.env.VITE_APP_GOOGLE_PLAY_URL,
)
