<script setup lang="ts">
import { ref, watch,computed, type PropType } from 'vue';
import type { IDashboardCard } from "@drax/dashboard-share";
import {useEntityStore} from "@drax/crud-vue";

const props = defineProps({
  modelValue: { type: Object as PropType<IDashboardCard>, required: true }
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

// Create a local reactive copy
const form = ref<IDashboardCard>(JSON.parse(JSON.stringify(props.modelValue)));

watch(() => props.modelValue, (newVal) => {
  form.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

// Ensure nested objects exist to avoid v-model errors
const ensureStructure = () => {
    if (!form.value.layout) form.value.layout = { cols: 12, sm: 12, md: 12, lg: 12, height: 450, cardVariant: 'outlined' };
    if (!form.value.groupBy) form.value.groupBy = { fields: [], dateFormat: 'day', render: 'pie' };
    if (!form.value.paginate) form.value.paginate = { columns: [], orderBy: '', order: '' };
};
ensureStructure();

const save = () => {
  emit('update:modelValue', form.value);
  emit('save');
};

const cancel = () => {
  emit('cancel');
};

const entities = computed(() => {
  const dashboardStore = useEntityStore();
  return dashboardStore.entities.map((entity: any) => entity.name)
})

const columns = computed(() => {
  const dashboardStore = useEntityStore();
  const entity =  dashboardStore.entities.find((entity: any) => entity.name === form.value.entity)
  return entity ? entity.headers.map((h:any) => ({title: h.title, value: h.key}) ) : []
})

function onEntityChange(){
  console.log('entity change',form.value)
  if(form.value){
    if(form.value.paginate){
      form.value.paginate.columns = []
    }
    if(form.value.groupBy){
      form.value.groupBy.fields = []
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
        <v-row dense>
          <!-- Base Config -->
          <v-col cols="12" md="12">
            <v-text-field v-model="form.title" label="Título de la tarjeta" variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-text-field>
          </v-col>
          <v-col cols="12" md="6" lg="4">
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
          <v-col cols="12" md="6" lg="4">
            <v-select v-model="form.type" :items="['groupBy' , 'paginate']" label="Tipo de tarjeta" variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-select>
          </v-col>

          <v-col cols="12" md="6" lg="4">
            <v-text-field v-if="form.layout" v-model="form.layout!.height" label="Altura" variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-text-field>
          </v-col>

          <v-divider class="my-2 w-100" v-if="form.type"></v-divider>

          <!-- Type specific config -->
          <template v-if="form.type === 'paginate'">
            <v-col cols="12">
               <div class="text-subtitle-2 mb-2 text-primary d-flex align-center"><v-icon icon="mdi-table" size="small" class="mr-1"></v-icon> Paginate</div>
            </v-col>
            <v-col cols="12">
              <v-select  item-title="title"
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
               <v-select v-model="form.paginate!.order" clearable :items="['asc', 'desc']" label="Dirección de orden" variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-select>
            </v-col>
          </template>

          <template v-else-if="form.type === 'groupBy'">
            <v-col cols="12">
               <div class="text-subtitle-2 mb-2 text-primary d-flex align-center"><v-icon icon="mdi-chart-pie" size="small" class="mr-1"></v-icon> Group By</div>
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
               <v-select v-model="form.groupBy!.dateFormat" :items="['year', 'month', 'day', 'hour', 'minute', 'second']" label="Formato de Fecha (opcional)" variant="outlined" density="compact" hide-details="auto" clearable class="mb-3"></v-select>
            </v-col>
            <v-col cols="12" md="6">
               <v-select v-model="form.groupBy!.render" :items="['pie', 'bars', 'table', 'gallery']" label="Render visual" variant="outlined" density="compact" hide-details="auto" class="mb-3"></v-select>
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}
</style>
