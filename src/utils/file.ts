/**
 * @description 获取静态资源地址
 * @param {string} url 文件地址
 * @return {string} 资源路径
 */
export function getAssetURL(url: string): string {
  return new URL(
    `../assets/${url.startsWith("/") ? url.slice(1) : url}`,
    import.meta.url
  ).href
}
