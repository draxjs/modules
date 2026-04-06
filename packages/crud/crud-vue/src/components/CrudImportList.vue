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
      :loading="importLoading"
      class="ma-3" density="compact" variant="outlined" color="secondary"
  >
    <v-card-title>
      {{ t('action.imports') }}
    </v-card-title>
    <v-card-text>
      <v-alert v-if="importError" type="error">
        {{ t('error.crud.import') }}
      </v-alert>
      <template v-else>
        <slot name="import-table" :importFiles="importFiles">
          <v-table density="compact">
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
            <tr v-for="importFile in importFiles">
              <td>
                <a v-if="importFile.url" :href="importFile.url" target="_blank">
                  {{t('crud.import.report')}}
                </a>
                <span v-else>-</span>
              </td>
              <td>{{ importFile.rowCount }}</td>
              <td>{{ importFile.successCount ?? '-' }}</td>
              <td>{{ importFile.errorCount ?? '-' }}</td>
              <td>{{ importFile.time }}</td>
            </tr>
            </tbody>
          </v-table>
        </slot>
      </template>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="importFiles = []" :loading="importLoading">{{ t('action.clear') }}</v-btn>
      <v-btn @click="importListVisible = false">{{ t('action.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>
