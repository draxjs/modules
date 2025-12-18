import HomePage from '@/modules/base/pages/home/index.vue'
import LoginPage from "@/modules/base/pages/user/LoginPage.vue";
import GoogleLoginCallback from "@/modules/base/pages/google/GoogleLoginCallback.vue";
import PoliticaPrivacidad from "@/modules/base/pages/info/PoliticaPrivacidad.vue";
import CondicionesServicio from "@/modules/base/pages/info/CondicionesServicio.vue";
import { AuditCrudAvPage } from "@drax/audit-vue";

const index = [
  {
    name: 'Root',
    path: '/',
    component: HomePage,
    meta: {
      auth: true,
    }
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    meta: {
      auth: true,
    }
  },
  {
    name: 'Login',
    path: '/login',
    component: LoginPage,
    meta: {
      auth: false,
    }
  },
  {
    name: 'GoogleLoginCallback',
    path: '/login/google/callback',
    component: GoogleLoginCallback,
    meta: {
      auth: false,
    }
  },
  {
    name: 'PoliticaPrivacidad',
    path: '/politica-privacidad',
    component: PoliticaPrivacidad,
    meta: {
      auth: false,
    }
  },
  {
    name: 'CondicionesServicio',
    path: '/condiciones-servicio',
    component: CondicionesServicio,
    meta: {
      auth: false,
    }
  },
  {
    name: 'AuditCrudAvPage',
    path: '/crud/audit-av',
    component: AuditCrudAvPage,
    meta: {
      auth: true,
      permission: 'audit:manage',
    },
    props: {
      useOnlyCustomActions: true,
      customMetrics: [],
      customActions: [
        {title: 'Logueo', value: 'loggedIn', color: 'blue', icon: 'mdi-account'},
        {title: 'Cambio de contraseña', value: 'changePassword', color: 'green', icon: 'mdi-lock-outline'},
        {title: 'Crear', value: 'created', color: 'green', icon: 'mdi-account-plus'},
        {title: 'Actualizar', value: 'updated', color: 'orange', icon: 'mdi-account-edit'},
        {title: 'Eliminar', value: 'deleted', color: 'red', icon: 'mdi-account-off'},
      ],
      customEntities: [
        { title: 'Usuario', value: 'User' },
        { title: 'Ciudad', value: 'Country' }
      ]
    }
  }
]


export default index
