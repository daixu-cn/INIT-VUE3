import type { HtmlTagDescriptor } from "vite"

export function injectScripts(scripts: string[]): HtmlTagDescriptor[] {
  return scripts.map(src => {
    return {
      injectTo: "head",
      tag: "script",
      attrs: { src }
    }
  })
}
