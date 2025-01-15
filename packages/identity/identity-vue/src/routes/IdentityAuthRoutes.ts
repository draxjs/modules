import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import PasswordPage from '../pages/PasswordChangePage.vue'
import RegistrationPage from '../pages/RegistrationPage.vue'
import PasswordRecoveryRequestPage from '../pages/PasswordRecoveryRequestPage.vue'
import PasswordRecoveryCompletePage from '../pages/PasswordRecoveryCompletePage.vue'

const routes = [
    {
        name: 'IdentityLogin',
        path: '/login',
        component: LoginPage,
        meta: {
            auth: false,
        }
    },
    {
        name: 'Profile',
        path: '/profile',
        component: ProfilePage,
        meta: {
            auth: true,
        }
    },
    {
        name: 'PasswordChange',
        path: '/password/change',
        component: PasswordPage,
        meta: {
            auth: true,
        }
    },
    {
        name: 'Registration',
        path: '/registration',
        component: RegistrationPage,
        meta: {
            auth: false,
        }
    },
    {
        name: 'PasswordRecoveryRequest',
        path: '/password/recovery/request',
        component: PasswordRecoveryRequestPage,
        meta: {
            auth: false,
        }
    },
    {
        name: 'PasswordRecoveryComplete',
        path: '/password/recovery/complete/:code',
        component: PasswordRecoveryCompletePage,
        meta: {
            auth: false,
        }
    },
]


export default routes
