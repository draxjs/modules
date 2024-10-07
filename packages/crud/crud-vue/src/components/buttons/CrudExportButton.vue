<script setup lang="ts">
import type {PropType} from "vue";
import EntityCrud from "../../EntityCrud";
import {useCrud} from "../../composables/UseCrud";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const {entity} = defineProps({
  entity: {type: Object as PropType<EntityCrud>, required: true},
})

const {
  exportLoading
} = useCrud(entity)
</script>

<template>
  <v-menu v-if="entity.isExportable">
    <template v-slot:activator="{ props: mp }">
      <v-tooltip location="top">
        <template v-slot:activator="{ props: tp }">
          <v-btn
              v-bind="{...mp, ...tp}"
              :disabled="exportLoading"
              class="mr-1"
              color="teal"
              variant="text"
              :loading="exportLoading"
              icon="mdi-database-export-outline"
          ></v-btn>
        </template>
        {{ t('action.export')}}
      </v-tooltip>

    </template>
    <v-list>
      <v-list-item v-for="format in entity.exportFormats" @click="$emit('export', format)">
        <v-list-item-title>{{format}}</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<style scoped>

</style>
