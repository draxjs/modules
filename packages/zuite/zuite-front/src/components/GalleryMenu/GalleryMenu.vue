<script setup lang="ts">
import MenuCard from '@/components/MenuCard/MenuCard.vue'
import {useMenu} from '@/composables/useMenu'
import {PropType} from "vue";
import type {MenuItem} from "@/types/menu";

const {isActive, isGranted, childActives, itemText} = useMenu()

defineProps({
  menu: {
    type: Array as PropType<MenuItem[]>,
    required: true
  }
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <template v-for="(item) in menu" key="item.text">

        <v-col
          v-if="item.children && isGranted(item) && item.gallery"
          cols="12"
          :key="item.text"
          :value="isActive(item)"
        >
          <h4 class="text-h4">
            {{ itemText(item) }}
          </h4>
          <v-divider class="mb-3"></v-divider>

          <v-row>
            <v-col cols="12" sm="4" md="4" lg="3"  xl="2"
                   v-for="child in childActives(item.children)"
                   :key="child.text"
            >
              <menu-card
                :title="itemText(child)"
                :icon="child.icon"
                :to="child.link"
              ></menu-card>
            </v-col>
          </v-row>

        </v-col>

        <v-col
          v-else-if="isGranted(item) && item.gallery"
          cols="12" sm="4" md="4" lg="3" xl="2"
          :key="'e'+item.text"
        >
          <menu-card
            :title="itemText(item)"
            :icon="item.icon"
            :to="item.link"
          ></menu-card>
        </v-col>

      </template>
    </v-row>

  </v-container>
</template>


<style scoped>

</style>
