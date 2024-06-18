import {createI18n} from "vue-i18n";
import messages from "@/i18n/I18nMessages";

const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages: messages
})

export default i18n
