<script setup lang="ts">
import {ref, watch, computed, type PropType} from 'vue';
import type {IDashboardCard} from "@drax/dashboard-share";
import {useEntityStore} from "@drax/crud-vue";
import type {
  IDraxFieldFilter,
  IEntityCrud,
  IEntityCrudFieldTypes,
  IEntityCrudFilter,
  IEntityCrudFilterOperators
} from "@drax/crud-share";
import {useI18n} from "vue-i18n"
import CrudFormField from "@drax/crud-vue/src/components/CrudFormField.vue";
import {useFilterIcon} from "@drax/crud-vue";

const props = defineProps({
  modelValue: {type: Object as PropType<IDashboardCard>, required: true}
});
const {filterIcon} = useFilterIcon()
const {t, te} = useI18n()

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

// Create a local reactive copy
const form = ref<IDashboardCard>(JSON.parse(JSON.stringify(props.modelValue)));

const entityStore = useEntityStore();

const entitySelected = computed<IEntityCrud>(() => {
  return entityStore.entities.find((entity: any) => entity.name === form.value.entity)
})

const entityField = computed(() => {
  return (fieldName: string) => {
    if(!entitySelected.value){
      return null
    }
    return entitySelected.value.fields.find(f => f.name === fieldName)
  }
})


const entities = computed(() => {
  return entityStore.entities.map((entity: any) => entity.name)
})

const columns = computed(() => {
  return entitySelected.value ? entitySelected.value.headers.map((h: any) => ({title: h.title, value: h.key})) : []
})


const filters = ref<IEntityCrudFilter[]>(prepareFilters(form.value.filters));

function prepareFilters(filters: IDraxFieldFilter[] = []): IEntityCrudFilter[] {

  return filters.map((filter: IDraxFieldFilter) => {
    let theField = entityField.value(filter.field)

    let value = filter.value
    if(value === 'true'){
      value = true
    }
    if(value === 'false'){
      value = false
    }

    return {
      name: filter.field,
      operator: filter.operator as IEntityCrudFilterOperators,
      value: value,
      type: theField?.type || 'string',
      label: theField?.label || '',
      default: '',
      ref: theField?.ref || '',
      refDisplay: theField?.refDisplay || '',
      enum: theField?.enum || []
    }

  })
}

watch(() => props.modelValue, (newVal) => {
  form.value = JSON.parse(JSON.stringify(newVal));
  ensureStructure();
}, {deep: true});

// Ensure nested objects exist to avoid v-model errors
const ensureStructure = () => {
  if (!form.value.layout) form.value.layout = {cols: 12, sm: 12, md: 12, lg: 12, height: 450, cardVariant: 'elevated'};
  if (!form.value.groupBy) form.value.groupBy = {fields: [], dateFormat: 'day', render: 'pie'};
  if (!form.value.paginate) form.value.paginate = {columns: [], orderBy: '', order: ''};
  if (!form.value.filters) form.value.filters = [];
};
ensureStructure();

const save = () => {
  const payload = form.value
  payload.filters = filters.value
      .filter((filter: IEntityCrudFilter) => filter.name && filter.operator)
      .map((filter: IEntityCrudFilter) => ({
        field: filter.name,
        operator: filter.operator as string,
        value: filter.value == null ? '' : String(filter.value)
      }))
  emit('update:modelValue', payload);
  emit('save');
};

const cancel = () => {
  emit('cancel');
};


function onEntityChange() {
  if (form.value) {
    if (form.value.paginate) {
      form.value.paginate.columns = []
    }
    if (form.value.groupBy) {
      form.value.groupBy.fields = []
    }
  }
}

const fieldI18n = computed(() => {
  return (field: IEntityCrudFilter) => {
    return te(entitySelected.value?.name?.toLowerCase() + ".field." + field.name) ? t(entitySelected.value?.name?.toLowerCase() + ".field." + field.name) : field.label
  }
})

const selectableFields = computed(() => {
  return entitySelected.value ?
      entitySelected.value.fields
          .filter((f: any) => !['fullFile', 'object', 'array.object'].includes(f.type))
          .map((f: any) => ({title: fieldI18n.value(f), value: f.name}))
      : []
})

const dynamicFilter = computed(() => {
  return (index: number) => {
    return filters.value[index]
  }
})

const operations = [
  {title: t('operation.equals'), value: 'eq'},
  {title: t('operation.notEquals'), value: 'ne'},
  {title: t('operation.contains'), value: 'like'},
  {title: t('operation.greaterThan'), value: 'gt'},
  {title: t('operation.lessThan'), value: 'lt'},
  {title: t('operation.greaterThanOrEqual'), value: 'gte'},
  {title: t('operation.lessThanOrEqual'), value: 'lte'},
]

function removeFilter(index: number) {
  if (filters.value) {
    filters.value.splice(index, 1)
  }
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
  if (filters.value) {
    filters.value.push(filter)
  }
}

function normalizeFieldType(type: string): IEntityCrudFieldTypes {
  if (type === 'array.ref') return 'ref';
  if (type === 'array.string') return 'string';
  if (type === 'longString') return 'string';
  if (type === 'array.number') return 'number';
  if (type === 'array.enum') return 'enum';
  return type as IEntityCrudFieldTypes;
}

function onUpdateField(index: number, val: string) {
  const field = entitySelected.value.fields.find((e: any) => e.name === val)
  let filter = dynamicFilter.value(index)
  if (!filter) {
    return
  }
  filter.value = null
  if (!field) return

  if (field.ref) {
    filter.ref = field.ref
  }
  if (field.refDisplay) {
    filter.refDisplay = field.refDisplay
  }
  if (field.enum) {
    filter.enum = field.enum
  }
  if (field.type) {
    filter.type = normalizeFieldType(field.type)
    if(field.type === 'boolean'){
      filter.value = false
    }
  }
}


</script>

<template>
  <v-card class="d-flex flex-column dashboard-card-editor" height="100%" color="surface" variant="flat">
    <v-card-title class="d-flex align-center bg-primary text-white py-2">
      <v-icon icon="mdi-pencil-box-outline" class="mr-2"></v-icon>
      Configuración de Tarjeta
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" size="small" @click="cancel"></v-btn>
    </v-card-title>

    <v-card-text class="pt-4 flex-grow-1 overflow-y-auto">
      <v-form @submit.prevent>
        <v-row v-if="form" dense>
          <!-- Base Config -->
          <v-col cols="12" md="12">
            <v-text-field v-model="form.title" label="Título de la tarjeta" variant="outlined" density="compact"
                          hide-details="auto" class="mb-3"></v-text-field>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-select :items="entities"
                      v-model="form.entity"
                      label="Entidad (ej. User, Country)"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      class="mb-3"
                      clearable
                      @update:modelValue="onEntityChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6" lg="6">
            <v-select v-model="form.type" :items="['groupBy' , 'paginate']" label="Tipo de tarjeta" variant="outlined"
                      density="compact" hide-details="auto" class="mb-3"></v-select>
          </v-col>

          <v-col cols="12" md="6" lg="6">
            <v-select v-model="form.layout!.cardVariant" :items="['elevated', 'outlined',  'flat','text','tonal','plain']" label="Tipo de tarjeta" variant="outlined"
                      density="compact" hide-details="auto" class="mb-3"></v-select>
          </v-col>


          <v-col cols="12" md="6" lg="6">
            <v-text-field v-if="form.layout" v-model="form.layout!.height" label="Altura" variant="outlined"
                          density="compact" hide-details="auto" class="mb-3"></v-text-field>
          </v-col>


          <v-divider class="my-2 w-100"></v-divider>
          <!-- Filters HERE -->
          <v-row dense class="mt-4">
            <v-col v-for="(filter,index) in filters"
                   :key="filter.name"
                   cols="12"
            >
              <v-row>
                <v-col cols="12" sm="4">
                  <v-select
                      :items="selectableFields"
                      v-model="dynamicFilter(index)!.name"
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
                      v-model="dynamicFilter(index)!.operator"
                      :label="t('crud.operator')"
                      density="compact"
                      variant="outlined"
                      hide-details
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <crud-form-field
                      v-if="entitySelected"
                      :field="filter"
                      :entity="entitySelected"
                      v-model="dynamicFilter(index)!.value"
                      :clearable="true"
                      density="compact"
                      variant="outlined"
                      :prepend-inner-icon="filterIcon(filter)"
                      hide-details
                  />
                </v-col>
                <v-col cols="12" sm="1">
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
              <v-btn small variant="outlined" color="primary" @click="addFilter">+ {{ t('action.addFilter') }}</v-btn>
            </v-col>

          </v-row>

          <v-divider class="my-2 w-100" v-if="form.type"></v-divider>

          <!-- Type specific config -->
          <template v-if="form.type === 'paginate'">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2 text-primary d-flex align-center">
                <v-icon icon="mdi-table" size="small" class="mr-1"></v-icon>
                Paginate
              </div>
            </v-col>
            <v-col cols="12">
              <v-select item-title="title"
                        item-value="value"
                        :items="columns"
                        v-model="form.paginate!.columns"
                        label="Columnas (presiona enter)"
                        multiple chips variant="outlined"
                        density="compact"
                        hide-details="auto"
                        class="mb-3">

              </v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                  item-title="title"
                  item-value="value"
                  :items="columns"
                  v-model="form.paginate!.orderBy"
                  label="Ordenar por campo"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  class="mb-3"
                  clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.paginate!.order" clearable :items="['asc', 'desc']" label="Dirección de orden"
                        variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-select>
            </v-col>
          </template>

          <template v-else-if="form.type === 'groupBy'">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2 text-primary d-flex align-center">
                <v-icon icon="mdi-chart-pie" size="small" class="mr-1"></v-icon>
                Group By
              </div>
            </v-col>
            <v-col cols="12">
              <v-select
                  item-title="title"
                  item-value="value"
                  :items="columns"
                  v-model="form.groupBy!.fields"
                  label="Campos de agrupación"
                  multiple chips variant="outlined"
                  density="compact" hide-details="auto"
                  class="mb-3"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.groupBy!.dateFormat" :items="['year', 'month', 'day', 'hour', 'minute', 'second']"
                        label="Formato de Fecha (opcional)" variant="outlined" density="compact" hide-details="auto"
                        clearable class="mb-3"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.groupBy!.render" :items="['pie', 'bars', 'table', 'gallery']"
                        label="Render visual" variant="outlined" density="compact" hide-details="auto"
                        class="mb-3"></v-select>
            </v-col>
          </template>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="bg-grey-lighten-4 py-3">
      <v-spacer></v-spacer>
      <v-btn color="grey-darken-1" variant="text" @click="cancel">Cancelar</v-btn>
      <v-btn color="primary" variant="flat" @click="save" class="px-6">Guardar Cambios</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.dashboard-card-editor {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
