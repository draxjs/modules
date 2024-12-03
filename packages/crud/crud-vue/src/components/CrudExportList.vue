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
  exportFiles, exportListVisible, exportLoading
} = useCrud(entity);

</script>

<template>
  <v-card
      v-if="exportListVisible"
      :loading="exportLoading"
      class="ma-3" density="compact" variant="outlined" color="secondary"
  >
    <v-card-title>
      {{ t('action.exports') }}

    </v-card-title>
    <v-card-text>
      <v-table density="compact">
        <thead>
        <tr>
          <th>Link</th><th>Rows</th><th>Time</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="exportFile in exportFiles">
          <td><a :href="exportFile.url" target="_blank">{{ exportFile.url }}</a></td>
          <td>{{ exportFile.rowCount }}</td>
          <td>{{ exportFile.time }}</td>
        </tr>
        </tbody>
      </v-table>

    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="exportFiles = []" :loading="exportLoading">{{ t('action.clear') }}</v-btn>
      <v-btn @click="exportListVisible=false">{{ t('action.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>
