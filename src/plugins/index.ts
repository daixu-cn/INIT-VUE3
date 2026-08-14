import "@/plugins/check-update"
import app from "@/global/app"
import { setupI18n } from "@/plugins/locale"
import { setupPinia } from "@/plugins/pinia"
import { setupRouter } from "@/plugins/route"
import { setupVuetify } from "@/plugins/vuetify"

app.use(setupI18n).use(setupRouter).use(setupPinia).use(setupVuetify)
