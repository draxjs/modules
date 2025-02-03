import SettingPage from '../pages/SettingPage.vue'

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

]


export default routes
