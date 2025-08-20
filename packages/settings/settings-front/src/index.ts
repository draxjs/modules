import {ISettingProvider} from './interfaces/ISettingProvider'
export type {ISettingProvider}

import {SettingRestProvider} from './providers/rest/SettingRestProvider.js'
import {SettingGqlProvider} from './providers/gql/SettingGqlProvider.js'
import {SettingProviderFactory} from './factory/SettingProviderFactory.js'
import {SettingI18nMessages} from './i18n/index.js'

export {
    SettingGqlProvider,
    SettingRestProvider,
    SettingProviderFactory,
    SettingI18nMessages
}
