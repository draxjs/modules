import {commonValidationI18n, identityValidationI18n, identityUserI18n} from "@drax/i18n-share"
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

const messages = merge.all([mainMsg,commonValidationI18n, identityValidationI18n, identityUserI18n])

console.log("messages",messages)

export default messages
