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

import type {MenuItem} from "../../../types/menu";
import {computed} from "vue";

interface Props {
  menu: MenuItem[]
}

const props = defineProps<Props>();

const itemText = computed(() => {
  return item => item.text
})

const isGranted = computed(() => {
  return item => {
    return true
  }
})

const childActives = computed(() => {
  return items => {
    //return items.filter(item => isGranted(item))
    return items.filter(item => true)
  }
})

const isAuth = computed(() => {
  return true
})

const isActive = computed(() => {
  return item => {
    return true
  }
  /* return item => {
     if(item.children){
       return item.children.some(i => {
         if(i.link && i.link.name){
           return i.link.name === this.$route.name
         }
         return false
       })
     }else if(item.link && item.link.name){
       return item.link.name === this.$route.name
     }

   }*/
})

</script>

<style scoped>

</style>
