<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
const {t} = useI18n()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

function filter() {
  emit('applyFilter')
}

function clear() {
  emit('clearFilter')
}

const emit = defineEmits(['applyFilter', 'clearFilter'])

</script>

<template>

    <v-card-actions id="crud-filters-actions" class="crud-filters-actions pb-0">
      <v-spacer />
      <v-btn id="crud-filters-clear-button" variant="text" density="compact" :class="['crud-filters-actions__clear-button', entity.cleanFilterClass]" @click="clear">{{ t('action.clear') }}</v-btn>
      <v-btn id="crud-filters-apply-button" variant="flat" density="compact" :class="['crud-filters-actions__apply-button', entity.applyFilterClass]"  @click="filter">
        {{ t('action.filter') }}
      </v-btn>
    </v-card-actions>

</template>

<style scoped>

</style>
