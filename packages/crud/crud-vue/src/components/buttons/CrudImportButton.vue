<script setup lang="ts">
import {ref} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share"
import {useCrud} from "../../composables/UseCrud";
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("import")
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
  <div v-if="entity.isImportable" id="crud-import-button-wrapper" class="crud-import-button-wrapper">
    <input
        ref="fileInput"
        id="crud-import-file-input"
        class="crud-import-button__file-input d-none"
        type="file"
        :accept="entity.importFormats.includes('CSV') && entity.importFormats.includes('JSON') ? '.csv,.json,application/json,text/csv' : entity.importFormats.includes('CSV') ? '.csv,text/csv' : '.json,application/json'"
        @change="onFileChange"
    />
    <v-menu id="crud-import-menu" class="crud-import-menu">
      <template v-slot:activator="{ props: mp }">
      <v-tooltip id="crud-import-button-tooltip" class="crud-import-button__tooltip" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
              v-bind="{...mp, ...props}"
              :disabled="importLoading"
              id="crud-import-button"
              class="crud-import-button mr-1"
              :variant="buttonConfig.variant"
              :rounded="buttonConfig.rounded"
              :color="buttonConfig.color"
              :loading="importLoading"
              :icon="buttonConfig.icon"
          ></v-btn>
        </template>
        {{ t('action.import')}}
      </v-tooltip>
      </template>
      <v-list id="crud-import-format-list" class="crud-import-menu__list">
        <v-list-item v-for="format in entity.importFormats" :id="`crud-import-format-${format}`" class="crud-import-menu__item" @click="selectFormat(format)">
          <v-list-item-title class="crud-import-menu__item-title">{{ format }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>

</style>
