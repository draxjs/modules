<script setup lang="ts">
import {useCrud} from "../composables/UseCrud";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
const {t} = useI18n()
const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  exportFiles, exportListVisible, exportLoading, exportError
} = useCrud(entity);

</script>

<template>
  <v-card
      v-if="exportListVisible"
      id="crud-export-list"
      :loading="exportLoading"
      class="crud-export-list ma-3" density="compact" variant="outlined" color="secondary"
  >
    <v-card-title id="crud-export-list-title" class="crud-export-list__title">
      {{ t('action.exports') }}

    </v-card-title>
    <v-card-text id="crud-export-list-content" class="crud-export-list__content">
      <v-alert v-if="exportError" id="crud-export-list-error" class="crud-export-list__error" type="error">
        {{ t('error.crud.export') }}
      </v-alert>
      <template v-else>
        <slot name="export-table" :exportFiles="exportFiles">
          <v-table id="crud-export-list-table" class="crud-export-list__table" density="compact">
            <thead>
              <tr>
                <th>Link</th>
                <th>Rows</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exportFile, index) in exportFiles" :id="`crud-export-list-row-${index}`" class="crud-export-list__row">
                <td class="crud-export-list__url-cell"><a :id="`crud-export-list-link-${index}`" class="crud-export-list__link" :href="exportFile.url" target="_blank">{{ exportFile.url }}</a></td>
                <td class="crud-export-list__row-count-cell">{{ exportFile.rowCount }}</td>
                <td class="crud-export-list__time-cell">{{ exportFile.time }}</td>
              </tr>
            </tbody>
          </v-table>
        </slot>
      </template>
    </v-card-text>

    <v-card-actions id="crud-export-list-actions" class="crud-export-list__actions">
      <v-spacer></v-spacer>
      <v-btn id="crud-export-list-clear-button" class="crud-export-list__clear-button" @click="exportFiles = []" :loading="exportLoading">{{ t('action.clear') }}</v-btn>
      <v-btn id="crud-export-list-close-button" class="crud-export-list__close-button" @click="exportListVisible=false">{{ t('action.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>
