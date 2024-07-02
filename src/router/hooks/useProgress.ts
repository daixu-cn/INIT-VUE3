import NProgress from "nprogress"

export default function useProgress(show = true) {
  if (show) {
    NProgress.start()
  } else {
    NProgress.done()
  }
}
