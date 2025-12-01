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
  <div v-if="entity.isImportable">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="props"
              :disabled="exportLoading"
              class="mr-1"
              variant="text"
              :loading="exportLoading"
              icon="mdi-database-import-outline"
          ></v-btn>
        </template>
        {{ t('action.import')}}
      </v-tooltip>

  </div>
</template>

<style scoped>

</style>
