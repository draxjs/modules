import type {MenuItem} from '../../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text:'HOME',
    link: { name: "/home/" },
    gallery: true
  },
  {
    icon: 'mdi-login',
    text:'LOGIN',
    link: { name: "/user/login/" },
    gallery: true
  },
  {
    icon: 'mdi-account-circle',
    text:'INFO',
    gallery: true,
    children: [
      {
        icon: 'mdi-information-outline',
        text:'ABOUT',
        link: { name: "/info/about/" },
        gallery: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text:'FAQ',
        link: { name: "/info/faq/" },
        gallery: true
      },
    ]
  }
]

export default menu

export {
  menu
}


