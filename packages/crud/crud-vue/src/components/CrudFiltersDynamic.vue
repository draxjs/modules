<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {useFilterIcon} from "../composables/UseFilterIcon";
import {useCrudStore} from "../stores/UseCrudStore";
import {useEntityStore} from "../stores/UseEntityStore";
import {useDynamicFilters} from "../composables/UseDynamicFilters.ts";

const {t, te} = useI18n()
const valueModel = defineModel({type: [Object]})
const {hasPermission} = useAuth()
const {filterIcon} = useFilterIcon()


const {entity, autoFilter} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  autoFilter: {type: Boolean, default: false}
})

const store = useCrudStore(entity?.name)
const entityStore = useEntityStore();
const storeEntity = entityStore.entities.find((e: any) => e.name === entity.name)

const aFields = computed(() => {
  return store.dynamicFilters
      .filter((field: IEntityCrudFilter) => !field.permission || hasPermission(field.permission))
})


const filtersRef = computed({
  get: () => store.dynamicFilters,
  set: v => store.dynamicFilters = v
})

const {
  dynamicFilter,
  selectableFields,
  getOperations,
  isValueRequired,
  onUpdateField,
  addFilter,
  removeFilter
} = useDynamicFilters(
    computed(() => entity.name),
    computed(() => storeEntity?.fields || []),
    filtersRef
)

function filter() {
  emit('applyFilter')
}

/*
function clear() {
  emit('clearFilter')
}
*/

function onUpdateValue() {
  if (autoFilter) {
    filter()
  }
}



const emit = defineEmits(['applyFilter', 'clearFilter'])

</script>

<template>
  <v-row dense class="mt-4">
    <v-col v-for="(filter,index) in aFields"
           :key="filter.name"
           cols="12" class="tdash"
    >
      <v-row >
        <v-col cols="12" sm="4">
          <v-select
              :items="selectableFields"
              v-model="dynamicFilter(index)!.name"
              :label="t('crud.field')"
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="(v:string) => onUpdateField(index, true)"
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
              :items="getOperations(index)"
              v-model="dynamicFilter(index)!.operator"
              :label="t('crud.operator')"
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="(v:string) => onUpdateField(index)"
          />
        </v-col>
        <v-col cols="10" sm="4">
          <crud-form-field
              v-if="isValueRequired(index)"
              :field="filter"
              :entity="entity"
              v-model="dynamicFilter(index)!.value"
              :clearable="true"
              density="compact"
              variant="outlined"
              :prepend-inner-icon="filterIcon(filter)"
              hide-details
              @updateValue="onUpdateValue"
          />
        </v-col>
        <v-col cols="2" sm="1">
          <v-btn @click="removeFilter(index)"
                 icon="mdi-delete"
                 class="mr-1"
                 variant="text"
                 color="red"
          >
          </v-btn>
        </v-col>
      </v-row>


    </v-col>

    <v-col cols="12">
      <v-btn size="small" variant="outlined" color="primary" @click="addFilter">+ {{ t('action.addFilter') }}</v-btn>
    </v-col>

  </v-row>

</template>

<style scoped>
.tdash{
  border-bottom-width: 0.5px;
  border-bottom-color: lightgray;
  border-bottom-style: dashed;
  margin-bottom: 10px;
}
</style>
