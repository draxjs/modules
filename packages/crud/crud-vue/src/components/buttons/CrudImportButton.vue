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
  <div v-if="entity.isImportable">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="props"
              :disabled="exportLoading"
              class="mr-1"
              color="purple"
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
