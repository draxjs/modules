import {CommonI18nMessages} from "@drax/common-front"
import {IdentityI18nMessages} from "@drax/identity-front"
import merge from 'deepmerge'

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

const messages = merge.all([mainMsg,IdentityI18nMessages, CommonI18nMessages])

console.log("messages",messages)

export default messages
