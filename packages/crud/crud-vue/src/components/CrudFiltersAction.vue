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

    <v-card-actions  class="pb-0">
      <v-spacer />
      <v-btn  variant="text" density="compact" :class="entity.cleanFilterClass" @click="clear">{{ t('action.clear') }}</v-btn>
      <v-btn variant="flat" density="compact" :class="entity.applyFilterClass"  @click="filter">
        {{ t('action.filter') }}
      </v-btn>
    </v-card-actions>

</template>

<style scoped>

</style>
