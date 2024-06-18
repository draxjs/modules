import type {MenuItem} from '../../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text:'HOME',
    link: { name: "Home" },
    gallery: true,
    auth: false
  },
  {
    icon: 'mdi-login',
    text:'LOGIN',
    link: { name: "Login" },
    gallery: true,
    auth: false
  },
  {
    icon: 'mdi-account-circle',
    text:'Admin',
    gallery: true,
    permission: 'identity:manage',
    children: [
      {
        icon: 'mdi-table-account',
        text:'Users',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
      },

    ]
  },
  {
    icon: 'mdi-information-box',
    text:'INFO',
    gallery: true,
    auth: false,
    children: [
      {
        icon: 'mdi-information-outline',
        text:'ABOUT',
        link: { name: "InfoAbout" },
        gallery: true,
        auth: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text:'FAQ',
        link: { name: "InfoFaq" },
        gallery: true,
        auth: false
      },
    ]
  }
]

export default menu

export {
  menu
}


