<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {useFilterIcon} from "../composables/UseFilterIcon";
import {useCrudStore} from "../stores/UseCrudStore";
import {useEntityStore} from "../stores/UseEntityStore";

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

const dynamicFilter = computed(() => {
  return (index: string | number) => {
    return store.dynamicFilters[index]
  }
})

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

const fieldI18n = computed(() => {
  return (field: IEntityCrudFilter) => {
    return te(entity.name.toLowerCase() + ".field." + field.name) ? t(entity.name.toLowerCase() + ".field." + field.name) : field.label
  }
})

const selectableFields = computed(() => {
  return storeEntity ? storeEntity.fields
      .filter((f: any) => !['fullFile', 'object', 'array.object'].includes(f.type))
      .map((f: any) => ({title: fieldI18n.value(f), value: f.name})) : []
})

function normalizeFieldType(type: string) :string{
  if (type === 'array.ref') return 'ref';
  if (type === 'array.string') return 'string';
  if (type === 'longString') return 'string';
  if (type === 'array.number') return 'number';
  if (type === 'array.enum') return 'enum';
  return type;
}

function onUpdateField(index: string | number, val: string){

  const field = storeEntity.fields.find((e: any) => e.name === val)
  dynamicFilter.value(index).value = null

  if (!field) return

  if(field.ref){
    dynamicFilter.value(index).ref = field.ref
  }
  if(field.refDisplay){
    dynamicFilter.value(index).refDisplay = field.refDisplay
  }
  if(field.enum){
    dynamicFilter.value(index).enum = field.enum
  }
  if(field.type){
    dynamicFilter.value(index).type = normalizeFieldType(field.type)

    if(field.type === 'boolean'){
      dynamicFilter.value(index).value = false
    }

  }
}

const operations = [
  {title: t('operation.equals'), value: 'eq'},
  {title: t('operation.notEquals'), value: 'ne'},
  {title: t('operation.contains'), value: 'like'},
  {title: t('operation.greaterThan'), value: 'gt'},
  {title: t('operation.lessThan'), value: 'lt'},
  {title: t('operation.greaterThanOrEqual'), value: 'gte'},
  {title: t('operation.lessThanOrEqual'), value: 'lte'},
 // {title: t('operation.in'), value: 'in'},
 // {title: t('operation.notIn'), value: 'nin'},
]

function removeFilter(index: string | number){
  store.removeDynamicFilter(index)
}

function addFilter() {
  const filter: IEntityCrudFilter = {
    default: undefined,
    label: "",
    name: '',
    operator: 'eq',
    type: 'string',
    permission: '',
    value: ''
  }
  store.addDynamicFilter(filter)
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
              v-model="dynamicFilter(index).name"
              :label="t('crud.field')"
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="(v:string) => onUpdateField(index, v)"
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
              :items="operations"
              v-model="dynamicFilter(index).operator"
              :label="t('crud.operator')"
              density="compact"
              variant="outlined"
              hide-details
          />
        </v-col>
        <v-col cols="10" sm="4">
          <crud-form-field
              :field="filter"
              :entity="entity"
              v-model="dynamicFilter(index).value"
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
