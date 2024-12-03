import CountryI18n from "./Country-i18n"
import LanguageI18n from "./Language-i18n"
import PersonI18n from "./Person-i18n"
import merge from 'deepmerge'

const messages =  merge.all([CountryI18n,LanguageI18n,PersonI18n])

export default messages
