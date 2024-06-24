<script setup lang="ts">
import {useMenu} from '@/composables/useMenu'
import {PropType} from "vue";
import type {MenuItem} from "@/types/menu";

const {isActive, isGranted, childActives, itemText } = useMenu()

defineProps({
  menu: {
    type: Array as PropType<MenuItem[]>,
    required: true
  }
});


</script>

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



<style scoped>

</style>
