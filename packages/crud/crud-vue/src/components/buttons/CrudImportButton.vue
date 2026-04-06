<script setup lang="ts">
import {ref} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share"
import {useCrud} from "../../composables/UseCrud";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  importLoading
} = useCrud(entity)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFormat = ref<'CSV' | 'JSON'>('CSV')

const emit = defineEmits(['import'])

function selectFormat(format: string) {
  selectedFormat.value = format as 'CSV' | 'JSON'
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  emit('import', file, selectedFormat.value)
  target.value = ''
}
</script>

<template>
  <div v-if="entity.isImportable">
    <input
        ref="fileInput"
        class="d-none"
        type="file"
        :accept="entity.importFormats.includes('CSV') && entity.importFormats.includes('JSON') ? '.csv,.json,application/json,text/csv' : entity.importFormats.includes('CSV') ? '.csv,text/csv' : '.json,application/json'"
        @change="onFileChange"
    />
    <v-menu>
      <template v-slot:activator="{ props: mp }">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="{...mp, ...props}"
              :disabled="importLoading"
              class="mr-1"
              variant="text"
              :loading="importLoading"
              icon="mdi-database-import-outline"
          ></v-btn>
        </template>
        {{ t('action.import')}}
      </v-tooltip>
      </template>
      <v-list>
        <v-list-item v-for="format in entity.importFormats" @click="selectFormat(format)">
          <v-list-item-title>{{ format }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>

</style>
