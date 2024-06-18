import merge from 'deepmerge'
import commonValidationI18n from "./common-validation-i18n";

const CommonI18nMessages = merge.all([commonValidationI18n])

export default CommonI18nMessages
export {CommonI18nMessages}
