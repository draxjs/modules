<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useCrudStore} from "../../stores/UseCrudStore";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const store = useCrudStore(entity?.name)

let dynamicFiltersEnable = computed({
  get: () => store.dynamicFiltersEnable,
  set: (value: boolean) => store.setDynamicFiltersEnable(value)
})

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("filter")
</script>

<template>
  <div v-if="entity.dynamicFiltersEnable" id="crud-filter-button-wrapper" class="crud-filter-button-wrapper">
    <v-tooltip id="crud-filter-button-tooltip" class="crud-filter-button__tooltip" location="top">
      <template v-slot:activator="{ props }">
        <v-btn
            v-bind="{ ...$attrs, ...props }"
            :icon="dynamicFiltersEnable ? buttonConfig.activeIcon : buttonConfig.icon"
            id="crud-filter-button"
            class="crud-filter-button mr-1"
            :variant="buttonConfig.variant"
            :rounded="buttonConfig.rounded"
            :color="buttonConfig.color"
            @click="dynamicFiltersEnable = !dynamicFiltersEnable"
        >
        </v-btn>
      </template>
      {{ t('action.filters') }}
    </v-tooltip>
  </div>
</template>

<style scoped>

</style>
