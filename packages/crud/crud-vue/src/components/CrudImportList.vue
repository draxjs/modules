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
  importFiles, importListVisible, importLoading, importError
} = useCrud(entity);

</script>

<template>
  <v-card
      v-if="importListVisible"
      id="crud-import-list"
      :loading="importLoading"
      class="crud-import-list ma-3" density="compact" variant="outlined" color="secondary"
  >
    <v-card-title id="crud-import-list-title" class="crud-import-list__title">
      {{ t('action.imports') }}
    </v-card-title>
    <v-card-text id="crud-import-list-content" class="crud-import-list__content">
      <v-alert v-if="importError" id="crud-import-list-error" class="crud-import-list__error" type="error">
        {{ t('error.crud.import') }}
      </v-alert>
      <template v-else>
        <slot name="import-table" :importFiles="importFiles">
          <v-table id="crud-import-list-table" class="crud-import-list__table" density="compact">
            <thead>
            <tr>
              <th> {{t('crud.import.link')}}</th>
              <th> {{t('crud.import.rows')}}</th>
              <th> {{t('crud.import.success')}}</th>
              <th> {{t('crud.import.error')}}</th>
              <th> {{t('crud.import.time')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(importFile, index) in importFiles" :id="`crud-import-list-row-${index}`" class="crud-import-list__row">
              <td class="crud-import-list__url-cell">
                <a v-if="importFile.url" :id="`crud-import-list-link-${index}`" class="crud-import-list__link" :href="importFile.url" target="_blank">
                  {{t('crud.import.report')}}
                </a>
                <span v-else class="crud-import-list__empty-link">-</span>
              </td>
              <td class="crud-import-list__row-count-cell">{{ importFile.rowCount }}</td>
              <td class="crud-import-list__success-count-cell">{{ importFile.successCount ?? '-' }}</td>
              <td class="crud-import-list__error-count-cell">{{ importFile.errorCount ?? '-' }}</td>
              <td class="crud-import-list__time-cell">{{ importFile.time }}</td>
            </tr>
            </tbody>
          </v-table>
        </slot>
      </template>
    </v-card-text>

    <v-card-actions id="crud-import-list-actions" class="crud-import-list__actions">
      <v-spacer></v-spacer>
      <v-btn id="crud-import-list-clear-button" class="crud-import-list__clear-button" @click="importFiles = []" :loading="importLoading">{{ t('action.clear') }}</v-btn>
      <v-btn id="crud-import-list-close-button" class="crud-import-list__close-button" @click="importListVisible = false">{{ t('action.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>
