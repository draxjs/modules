import merge from 'deepmerge'
import commonValidationI18n from "./common-validation-i18n";
import commonErrorI18n from "./common-error-i18n";
import commonActionI18n from "./common-action-i18n";

const CommonI18nMessages = merge.all([commonValidationI18n,commonErrorI18n, commonActionI18n])

export default CommonI18nMessages
export {CommonI18nMessages}
