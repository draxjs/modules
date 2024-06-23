import {createI18n} from "vue-i18n";
import messages from "./I18nMessages.js";

const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages: messages as any
})

export default i18n
