<script setup lang="ts">
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share"
import {useCrud} from "../../composables/UseCrud";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  exportLoading
} = useCrud(entity)
</script>

<template>
  <v-menu v-if="entity.isExportable" id="crud-export-menu" class="crud-export-menu">
    <template v-slot:activator="{ props: mp }">
      <v-tooltip id="crud-export-button-tooltip" class="crud-export-button__tooltip" location="top">
        <template v-slot:activator="{ props: tp }">
          <v-btn
              v-bind="{...mp, ...tp}"
              :disabled="exportLoading"
              id="crud-export-button"
              class="crud-export-button mr-1"
              variant="text"
              :loading="exportLoading"
              icon="mdi-database-export-outline"
          ></v-btn>
        </template>
        {{ t('action.export')}}
      </v-tooltip>

    </template>
    <v-list id="crud-export-format-list" class="crud-export-menu__list">
      <v-list-item v-for="format in entity.exportFormats" :id="`crud-export-format-${format}`" class="crud-export-menu__item" @click="$emit('export', format)">
        <v-list-item-title class="crud-export-menu__item-title">{{format}}</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<style scoped>

</style>
