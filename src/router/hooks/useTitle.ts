import type { RouteLocationNormalized } from "vue-router"
import { TITLE } from "@/global/env"

export default function useTitle({ meta: { title } }: RouteLocationNormalized) {
  document.title = title ? `${title} | ${TITLE}` : TITLE
}
