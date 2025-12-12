import SettingPage from '../pages/SettingPage.vue'
import SettingCardPage from '../pages/SettingCardPage.vue'
import SettingAvPage from '../pages/SettingAvPage.vue'

const routes = [
    {
        name: 'SettingPage',
        path: '/settings',
        component: SettingPage,
        meta: {
            auth: true,
            permission: 'setting:manage'
        }
    },
    {
        name: 'SettingCardPage',
        path: '/settings/card',
        component: SettingCardPage,
        meta: {
            auth: true,
            permission: 'setting:manage'
        }
    },
    {
        name: 'SettingAvPage',
        path: '/settings/av',
        component: SettingAvPage,
        meta: {
            auth: true,
            permission: 'setting:manage'
        }
    },
]


export default routes
