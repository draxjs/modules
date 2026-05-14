<script setup lang="ts">
import {computed, onBeforeMount, watch, type PropType} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import type {IEntityCrud} from "@drax/crud-share";
import CrudForm from "./CrudForm.vue";
import CrudNotify from "./CrudNotify.vue";
import {useCrud} from "../composables/UseCrud";
import {useCrudStore} from "../stores/UseCrudStore";
import getItemId from "../helpers/getItemId";

type RouteCrudMode = 'create' | 'edit' | 'view'

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled'])

const route = useRoute()
const router = useRouter()
const store = useCrudStore(entity?.name)
const {t, te} = useI18n()

const {
  resetCrudStore,
  prepareFilters,
  prepareSort,
  operation,
  form,
  notify,
  message,
  setForm,
  setOperation,
  cast,
  cloneItem,
} = useCrud(entity)

const routeMode = computed<RouteCrudMode | null>(() => {
  const mode = getQueryParam('mode')
  return isRouteCrudMode(mode) ? mode : null
})

const routeId = computed(() => getQueryParam('id'))

const formReady = computed(() => {
  return operation.value === 'create' || Boolean(form.value && Object.keys(form.value).length > 0)
})

onBeforeMount(() => {
  resetCrudStore()
  prepareFilters()
  prepareSort()
  prepareRouteForm()
})

watch(
    () => [route.query.mode, route.query.id],
    () => prepareRouteForm()
)

function getQueryParam(name: string): string | null {
  const value = route.query[name]

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function isRouteCrudMode(mode: string | null): mode is RouteCrudMode {
  return mode === 'create' || mode === 'edit' || mode === 'view'
}

function cancel() {
  emit('canceled')
  goToList()
}

function goToList() {
  router.push({
    name: route.name ?? undefined,
    path: route.name ? undefined : route.path,
    params: route.params,
    hash: route.hash,
    query: {},
  })
}

function getCreatedItemId(item: any) {
  return entity.identifier ? item?.[entity.identifier] : getItemId(item)
}

function goToEdit(item: any) {
  const id = getCreatedItemId(item)

  if (!id) {
    return
  }

  router.push({
    name: route.name ?? undefined,
    path: route.name ? undefined : route.path,
    params: route.params,
    hash: route.hash,
    query: {
      mode: 'edit',
      id: String(id),
    },
  })
}

function created(item: any) {
  emit('created', item)
  goToEdit(item)
}

async function prepareRouteForm() {
  const mode = routeMode.value

  if (!mode) {
    return
  }

  store.resetErrors()

  if (mode === 'create') {
    setOperation('create')
    setForm(entity.form)
    return
  }

  if (!routeId.value) {
    store.setError('Missing id query param')
    return
  }

  try {
    store.setLoading(true)

    if (!entity.provider.findById) {
      throw new Error('provider.findById not implemented')
    }

    const item = await entity.provider.findById(routeId.value)

    if (!item) {
      throw new Error('Item not found')
    }

    setOperation(mode)
    setForm(cast(cloneItem(item)))
  } catch (e: any) {
    setOperation(mode)
    setForm({})
    store.setError(e.message || 'An error occurred while loading the entity')
    console.error('Error loading entity by id', e)
  } finally {
    store.setLoading(false)
  }
}
</script>

<template>
  <v-container :fluid="entity.containerFluid" class="mt-5">
    <v-card :class="entity.cardClass" :density="entity.cardDensity">
      <v-progress-linear v-if="store.loading" indeterminate/>

      <v-card-actions class="justify-start pa-2 pb-0">
        <v-btn
            prepend-icon="mdi-arrow-left"
            variant="text"
            @click="goToList"
        >
          {{ te('action.back') ? t('action.back') : 'Volver' }}
        </v-btn>
      </v-card-actions>

      <crud-form
          v-if="formReady || store.error"
          :entity="entity"
          show-submit-and-return
          @created="created"
          @updated="item => emit('updated', item)"
          @deleted="emit('deleted')"
          @viewed="emit('viewed')"
          @canceled="cancel"
          @saved-and-return="goToList"
      >
        <template v-for="ifield in entity.fields" :key="ifield.name" v-slot:[`field.${ifield.name}`]="{field, form, modelValue, setValue}">
          <slot :name="`field.${ifield.name}`" v-bind="{field, form, modelValue, setValue}">
          </slot>
        </template>
      </crud-form>
    </v-card>

    <crud-notify v-model="notify" :message="message"></crud-notify>
  </v-container>
</template>
