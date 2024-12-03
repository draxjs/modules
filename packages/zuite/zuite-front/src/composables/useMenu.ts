import {useRoute} from 'vue-router'
import {useAuth} from "@drax/identity-vue";
import type {MenuItem} from "../types/menu";
import {computed} from "vue";

export function useMenu() {

  const route = useRoute()
  const auth = useAuth()


  const itemText = computed(() => {
    return (item: MenuItem) => item.text
  })


  const isGranted = (item: MenuItem) => {
    if (item.auth && !isAuth.value) {
      return false;
    }
    if (item.permission && !auth.hasPermission(item.permission)) {
      return false;
    }
    return true;
  };

  const childActives = computed(() => {
    return (items: MenuItem[]) => {
      return items.filter((item: MenuItem) => isGranted(item))
    }
  })

  const isAuth = computed(() => {
    return auth.isAuthenticated()
  })

  const isActive = computed(() => {
    return (item: MenuItem) => {
      if (item.children) {
        return item.children.some((i: MenuItem) => {
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
    childActives,
    isAuth,
    isActive,

  }
}
