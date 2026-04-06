
import merge from "deepmerge";
import PersonMessages from "./Person-i18n"
import CountryMessages from "./Country-i18n"
import LanguageMessages from "./Language-i18n"

const messages = merge.all([
    PersonMessages,
    CountryMessages,
    LanguageMessages
])

export default messages
