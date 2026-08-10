import useLocaleStore from "@/store/locale"
import useSnackbarStore from "@/store/snackbar"
import useThemeStore from "@/store/theme"
import useUserStore from "@/store/user"

export default function () {
  return {
    user: useUserStore(),
    theme: useThemeStore(),
    locale: useLocaleStore(),
    snackbar: useSnackbarStore(),
  }
}
