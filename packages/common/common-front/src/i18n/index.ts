import merge from 'deepmerge'
import commonValidationI18n from "./common-validation-i18n";
import commonErrorI18n from "./common-error-i18n";
import commonActionI18n from "./common-action-i18n";
import commonCrudI18n from "./common-crud-i18n";
import commonOperationI18n from "./common-operation-i18n";
import commonI18n from "./common-i18n";

const CommonI18nMessages = merge.all([commonI18n, commonValidationI18n,commonErrorI18n, commonActionI18n,commonCrudI18n,commonOperationI18n])

export default CommonI18nMessages
export {CommonI18nMessages}
