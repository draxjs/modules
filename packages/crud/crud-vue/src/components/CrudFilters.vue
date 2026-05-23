<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import CrudFieldRange from "./CrudFieldRange.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useAuth} from "@drax/identity-vue";
import {useFilterIcon} from "../composables/UseFilterIcon";

const valueModel = defineModel({type: [Object]})
const {hasPermission} = useAuth()
const {filterIcon} = useFilterIcon()

const {entity, autoFilter} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  autoFilter: {type: Boolean, default: false}
})

const aFields = computed(() => {
  return entity.filters.filter((field:IEntityCrudFilter) => !field.permission || hasPermission(field.permission))
})

function isRangeFilter(filter: IEntityCrudFilter) {
  return filter.type === 'date' && filter.operator === 'range'
}

function filter() {
  emit('applyFilter')
}

/*
function clear() {
  emit('clearFilter')
}
*/

function onUpdateValue(){
  if(autoFilter){
    filter()
  }
}

const emit = defineEmits(['applyFilter', 'clearFilter'])

</script>

<template>
  <v-card id="crud-filters" class="crud-filters" flat >
        <v-row id="crud-filters-row" class="crud-filters__row mt-1" dense>
          <v-col v-for="(filter,index) in aFields"
                 :key="filter.name"
                 :id="`crud-filter-column-${filter.name}`"
                 class="crud-filters__column"
                 :cols="filter.cols ? filter.cols : 12"
                 :sm="filter.sm ? filter.sm : 6"
                 :md="filter.md ? filter.md : 6"
                 :lg="filter.lg ? filter.lg : 4"
                 :xl="filter.xl ? filter.xl : 3"
          >

            <slot :name="`filter.${filter.name}`" v-bind="{filter, filterIndex: index}">
              <crud-field-range
                  v-if="filter && valueModel[index] !== undefined && isRangeFilter(filter)"
                  :id="`crud-filter-range-${filter.name}`"
                  class="crud-filters__range-field"
                  :name="filter.name"
                  :label="filter.label"
                  :entity="entity"
                  :field="filter"
                  v-model="valueModel[index].value"
                  :clearable="true"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @updateValue="onUpdateValue"
              />
              <crud-form-field
                  v-else-if="filter && valueModel[index] !== undefined"
                  :id="`crud-filter-field-${filter.name}`"
                  class="crud-filters__field"
                  :field="filter"
                  :entity="entity"
                  v-model="valueModel[index].value"
                  :clearable="true"
                  density="compact"
                  variant="outlined"
                  :prepend-inner-icon="filterIcon(filter)"
                  hide-details
                  @updateValue="onUpdateValue"
              />
            </slot>

          </v-col>

        </v-row>

  </v-card>
</template>

<style scoped>

</style>
