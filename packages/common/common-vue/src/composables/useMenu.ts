import {useRoute} from 'vue-router'
import {useAuth} from "@drax/identity-vue";
import type {IMenuItem} from "@drax/common-share";
import {computed} from "vue";
import {useI18n} from "vue-i18n"

export function useMenu() {

  const {t, te} = useI18n()
  const route = useRoute()
  const auth = useAuth()


  const itemText = computed(() => {
    return (item: IMenuItem) => te(item.text) ? t(item.text) : item.text
  })


  const isGranted = (item: IMenuItem) => {
    if (item.auth && !isAuth.value) {
      return false;
    }
    if (item.permission && !auth.hasPermission(item.permission)) {
      return false;
    }
    return true;
  };

  const childrenGranted = computed(() => {
    return (items: IMenuItem[]) => {
      return items.filter((item: IMenuItem) => isGranted(item))
    }
  })

  const hasChildrenGranted = computed(() => {
    return (items: IMenuItem[]) => {
      return items.some((item: IMenuItem) => isGranted(item))
    }
  })

  const isAuth = computed(() => {
    return auth.isAuthenticated()
  })

  const isActive = computed(() => {
    return (item: IMenuItem) => {
      if (item.children) {
        return item.children.some((i: IMenuItem) => {
          if (i.link && i.link.name) {
            return i.link.name === route.name
          }
          return false
        })
      } else if (item.link && item.link.name) {
        return item.link.name === route.name
      }

    }
  })

  return {
    itemText,
    isGranted,
    childrenGranted,
    hasChildrenGranted,
    isAuth,
    isActive,

  }
}
