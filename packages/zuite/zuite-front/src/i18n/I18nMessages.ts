import {IdentityI18nMessages} from "@drax/identity-front"
import {CommonI18nMessages } from "@drax/common-front"
import merge from 'deepmerge'
import {LocaleMessages} from "vue-i18n";
import people from '../modules/people/i18n/index'
import main from './main-i18n'


const messages = merge.all([main, people, CommonI18nMessages,IdentityI18nMessages]) as LocaleMessages<any>

export default messages
