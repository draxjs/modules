import {IdentityI18nMessages} from "@drax/identity-front"
import {CommonI18nMessages } from "@drax/common-front"
import merge from 'deepmerge'
import {LocaleMessages} from "vue-i18n";

const mainMsg = {
  en: {
    main: {
      home: 'Home',
    }
  },
  es: {
    main: {
      home: 'Principal',
    }
  }
}

const messages = merge.all([mainMsg,CommonI18nMessages,IdentityI18nMessages]) as LocaleMessages<any>

export default messages
