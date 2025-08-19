import type {MenuItem} from '../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text:'HOME',
    link: { name: "Home" },
    gallery: false,
    auth: false
  },

  {
    icon: 'mdi-world',
    text: 'People',
    gallery: true,
    children: [
      {
        icon: 'mdi-person',
        text:'Person',
        link: { name: "PersonCrudPage" },
        gallery: true,
        permission: 'person:manage'
      },
      {
        icon: 'mdi-country',
        text:'Country',
        link: { name: "CountryCrudPage" },
        gallery: true,
        permission: 'country:manage'
      },
      {
        icon: 'mdi-language',
        text:'Language',
        link: { name: "LanguageCrudPage" },
        gallery: true,
        permission: 'language:manage'
      },
    ]
  },
  {
    icon: 'mdi-account-circle',
    text:'Admin',
    gallery: true,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-domain',
        text:'Tenant',
        link: { name: "CrudTenant" },
        gallery: true,
        permission: 'tenant:manage'
      },
      {
        icon: 'mdi-chair-rolling',
        text:'Roles',
        link: { name: "CrudRole" },
        gallery: true,
        permission: 'role:manage'
      },

      {
        icon: 'mdi-table-account',
        text:'Users',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
      },
      {
        icon: 'mdi mdi-table-key',
        text:'Api Keys',
        link: { name: "CrudUserApiKey" },
        gallery: true,
        permission: 'userApiKey:manage'
      },
      {
        icon: 'mdi mdi-cogs',
        text:'Settings',
        link: { name: "SettingPage" },
        gallery: true,
        permission: 'setting:manage'
      },
    ]
  }

]

export default menu

export {
  menu
}


