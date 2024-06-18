<template>
  <v-list dense class="pt-3">
    <template v-for="(item) in menu" :key="item.text">

      <v-list-group
        v-if="item.children && isGranted(item)"
        :value="isActive(item)"
      >

        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="item.icon"
            :title="itemText(item)"
          />
        </template>

        <v-list-item
          v-for="child in childActives(item.children)"
          :key="child.text"
          :to="child.link"
          :prepend-icon="child.icon"
          :title="itemText(child)"
        />

      </v-list-group>


      <v-list-item
        v-else-if="isGranted(item)"
        :to="item.link" exact
        :prepend-icon="item.icon"
        :title="itemText(item)"
      />

    </template>
  </v-list>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {useAuth} from "@drax/identity-vue";

const route = useRoute()
const auth = useAuth()

import type {MenuItem} from "../../../types/menu";
import {computed} from "vue";

interface Props {
  menu: MenuItem[]
}

const props = defineProps<Props>();

const itemText = computed(() => {
  return (item:MenuItem) => item.text
})


const isGranted = (item: MenuItem) => {
  if(item.auth &&!isAuth.value){
    return false;
  }
  if(item.permission && !auth.hasPermission(item.permission)){
    return false;
  }
  return true;
};

const childActives = computed(() => {
  return (items: MenuItem[]) => {
    return items.filter((item : MenuItem) => isGranted(item))
  }
})

const isAuth = computed(() => {
  return auth.isAuthenticated()
})

const isActive = computed(() => {
  return (item: MenuItem) => {
     if(item.children){
       return item.children.some((i: MenuItem) => {
         if(i.link && i.link.name){
           return i.link.name === route.name
         }
         return false
       })
     }else if(item.link && item.link.name){
       return item.link.name === route.name
     }

   }
})

</script>

<style scoped>

</style>
