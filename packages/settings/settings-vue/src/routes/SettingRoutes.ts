import SettingPage from '../pages/SettingPage.vue'
import SettingCardPage from '../pages/SettingCardPage.vue'

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

]


export default routes
