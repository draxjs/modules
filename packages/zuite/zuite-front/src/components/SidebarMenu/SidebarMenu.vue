<script setup lang="ts">
import {useMenu} from '../../composables/useMenu'
import {PropType} from "vue";
import type {IMenuItem} from "@drax/common-share";

const { isGranted, childrenGranted,hasChildrenGranted, itemText } = useMenu()

defineProps({
  menu: {
    type: Array as PropType<IMenuItem[]>,
    required: true
  }
});


</script>

<template>
  <v-list dense class="pt-3">
    <template v-for="(item,index) in menu" >

      <v-list-group
        v-if="isGranted(item) && item.children && hasChildrenGranted(item.children)"
        :value="index"
        :key="`group-${index}`"
      >

        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="item.icon"
            :title="itemText(item)"
          />
        </template>

        <v-list-item
          v-for="(child, i) in childrenGranted(item.children)"
          :key="`child-${index}-${i}`"
          :to="child.link"
          :prepend-icon="child.icon"
          :title="itemText(child)"
        />

      </v-list-group>


      <v-list-item
        v-else-if="isGranted(item) && !item.children"
        :to="item.link" exact
        :prepend-icon="item.icon"
        :title="itemText(item)"
        :key="`item-${index}`"
      />

    </template>
  </v-list>
</template>



<style scoped>

</style>
