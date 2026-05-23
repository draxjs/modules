<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {useFilterIcon} from "../composables/UseFilterIcon";
import {useCrudStore} from "../stores/UseCrudStore";
import {useEntityStore} from "../stores/UseEntityStore";
import {useDynamicFilters} from "../composables/UseDynamicFilters";

const {t} = useI18n()
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

function numericIndex(index: string | number) {
  return typeof index === 'number' ? index : Number(index)
}

function getDynamicFilter(index: string | number) {
  return dynamicFilter.value(numericIndex(index))
}

function updateDynamicField(index: string | number, resetOperator = false) {
  onUpdateField(numericIndex(index), resetOperator)
}

function getDynamicOperations(index: string | number) {
  return getOperations.value(numericIndex(index))
}

function dynamicValueRequired(index: string | number) {
  return isValueRequired.value(numericIndex(index))
}

function deleteFilter(index: string | number) {
  removeFilter(numericIndex(index))
}



const emit = defineEmits(['applyFilter', 'clearFilter'])

</script>

<template>
  <v-row id="crud-dynamic-filters" class="crud-dynamic-filters mt-4" dense>
    <v-col v-for="(filter,index) in aFields"
           :key="filter.name"
           :id="`crud-dynamic-filter-${index}`"
           cols="12" class="crud-dynamic-filters__item tdash"
    >
      <v-row :id="`crud-dynamic-filter-row-${index}`" class="crud-dynamic-filters__item-row">
        <v-col :id="`crud-dynamic-filter-field-column-${index}`" class="crud-dynamic-filters__field-column" cols="12" sm="4">
          <v-select
              :id="`crud-dynamic-filter-field-select-${index}`"
              class="crud-dynamic-filters__field-select"
              :items="selectableFields"
              v-model="getDynamicFilter(index)!.name"
              :label="t('crud.field')"
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="(_v:string) => updateDynamicField(index, true)"
          />
        </v-col>
        <v-col :id="`crud-dynamic-filter-operator-column-${index}`" class="crud-dynamic-filters__operator-column" cols="12" sm="3">
          <v-select
              :id="`crud-dynamic-filter-operator-select-${index}`"
              class="crud-dynamic-filters__operator-select"
              :items="getDynamicOperations(index)"
              v-model="getDynamicFilter(index)!.operator"
              :label="t('crud.operator')"
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="(_v:string) => updateDynamicField(index)"
          />
        </v-col>
        <v-col :id="`crud-dynamic-filter-value-column-${index}`" class="crud-dynamic-filters__value-column" cols="10" sm="4">
          <crud-form-field
              v-if="dynamicValueRequired(index)"
              :id="`crud-dynamic-filter-value-field-${index}`"
              class="crud-dynamic-filters__value-field"
              :field="filter"
              :entity="entity"
              v-model="getDynamicFilter(index)!.value"
              :clearable="true"
              density="compact"
              variant="outlined"
              :prepend-inner-icon="filterIcon(filter)"
              hide-details
              @updateValue="onUpdateValue"
          />
        </v-col>
        <v-col :id="`crud-dynamic-filter-delete-column-${index}`" class="crud-dynamic-filters__delete-column" cols="2" sm="1">
          <v-btn @click="deleteFilter(index)"
                 :id="`crud-dynamic-filter-delete-button-${index}`"
                 icon="mdi-delete"
                 class="crud-dynamic-filters__delete-button mr-1"
                 variant="text"
                 color="red"
          >
          </v-btn>
        </v-col>
      </v-row>


    </v-col>

    <v-col id="crud-dynamic-filters-add-column" class="crud-dynamic-filters__add-column" cols="12">
      <v-btn id="crud-dynamic-filters-add-button" class="crud-dynamic-filters__add-button" size="small" variant="outlined" color="primary" @click="addFilter">+ {{ t('action.addFilter') }}</v-btn>
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
