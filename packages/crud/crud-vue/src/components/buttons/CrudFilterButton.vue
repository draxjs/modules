<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useCrudStore} from "../../stores/UseCrudStore";

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const store = useCrudStore(entity?.name)

let dynamicFiltersEnable = computed({
  get: () => store.dynamicFiltersEnable,
  set: (value: boolean) => store.setDynamicFiltersEnable(value)
})

const {t} = useI18n()
</script>

<template>
  <div v-if="entity.isFilterable">
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn
            v-bind="{ ...$attrs, ...props }"
            :icon="dynamicFiltersEnable ? 'mdi-filter-off' : 'mdi-filter' "
            class="mr-1"
            variant="text"
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
