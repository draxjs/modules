import type {MenuItem} from '../../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text:'HOME',
    link: { name: "Home" },
    gallery: true
  },
  {
    icon: 'mdi-login',
    text:'LOGIN',
    link: { name: "Login" },
    gallery: true
  },
  {
    icon: 'mdi-account-circle',
    text:'Admin',
    gallery: true,
    children: [
      {
        icon: 'mdi-table-account',
        text:'Users',
        link: { name: "CrudUser" },
        gallery: true
      },

    ]
  },
  {
    icon: 'mdi-information-box',
    text:'INFO',
    gallery: true,
    children: [
      {
        icon: 'mdi-information-outline',
        text:'ABOUT',
        link: { name: "InfoAbout" },
        gallery: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text:'FAQ',
        link: { name: "InfoFaq" },
        gallery: true
      },
    ]
  }
]

export default menu

export {
  menu
}


