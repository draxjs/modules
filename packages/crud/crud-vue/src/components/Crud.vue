<script setup lang="ts">
import {computed, onBeforeMount, ref, watch, type PropType} from "vue";
import {useRoute, useRouter} from "vue-router";
import type {IEntityCrud} from "@drax/crud-share";
import CrudListTable from "./CrudListTable.vue";
import CrudListGallery from "./CrudListGallery.vue";
import CrudForm from "./CrudForm.vue";
import CrudRouteForm from "./CrudRouteForm.vue";
import CrudNotify from "./CrudNotify.vue";
import CrudDialog from "./CrudDialog.vue";
import CrudAiButton from "./buttons/CrudAiButton.vue";
import CrudDialogNextButton from "./buttons/CrudDialogNextButton.vue";
import CrudDialogPrevButton from "./buttons/CrudDialogPrevButton.vue";
import CrudOpenRouteFormButton from "./buttons/CrudOpenRouteFormButton.vue";
import CrudAi from "./CrudAi.vue";
import {useCrud} from "../composables/UseCrud";
import {useDisplay} from 'vuetify'
import {useAuth} from "@drax/identity-vue";
import CrudRowValue from "./CrudRowValue.vue";
import getItemId from "../helpers/getItemId";

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  onCreate, onEditAt, onDeleteAt, resetCrudStore,
  operation, dialog, notify, message, doExport, doImport,
  prepareFilters, prepareSort, form,
  onViewAt, navigateView, canNavigateItems, canNavigatePrev, canNavigateNext
} = useCrud(entity);

const {hasPermission} = useAuth()
const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  resetCrudStore()
  prepareFilters()
  prepareSort()
})

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled'])
const aiExpanded = ref(false)

const listComponent = computed(() => {
  const listMode = entity?.listMode
  switch (listMode){
    case 'responsive':
      return xs.value ? CrudListGallery : CrudListTable
    case 'gallery':
      return CrudListGallery
    case 'table':
      return CrudListTable
    default:
      return xs.value ? CrudListGallery : CrudListTable
  }
})

const {xs} = useDisplay()

const routeCrudMode = computed(() => {
  const mode = getQueryParam('mode')
  return ['create', 'edit', 'view'].includes(mode || '') ? mode : null
})

const routeCrudId = computed(() => getQueryParam('id'))

const isRouteCrudForm = computed(() => {
  if (routeCrudMode.value === 'create') {
    return true
  }

  return ['edit', 'view'].includes(routeCrudMode.value || '') && !!routeCrudId.value
})

const canOpenRouteCrudForm = computed(() => {
  if (operation.value === 'create') {
    return true
  }

  return ['edit', 'view'].includes(operation.value || '') && !!getFormId()
})

function getQueryParam(name: string): string | null {
  const value = route.query[name]

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function applyAiSuggestions(values: Record<string, any>) {
  form.value = values
}

function getFormId() {
  return entity.identifier ? form.value?.[entity.identifier] : getItemId(form.value)
}

function openRouteCrudForm() {
  if (!operation.value || !['create', 'edit', 'view'].includes(operation.value)) {
    return
  }

  const query: Record<string, string> = {
    mode: operation.value,
  }

  if (operation.value !== 'create') {
    const id = getFormId()

    if (!id) {
      return
    }

    query.id = String(id)
  }

  router.push({
    name: route.name ?? undefined,
    path: route.name ? undefined : route.path,
    params: route.params,
    hash: route.hash,
    query,
  })
}

watch(dialog, (value) => {
  if (!value) {
    aiExpanded.value = false
  }
})


</script>

<template>
  <crud-route-form
      v-if="isRouteCrudForm"
      :id="`crud-route-form-${entity.name}`"
      class="crud__route-form"
      :entity="entity"
      @created="item => emit('created', item)"
      @updated="item => emit('updated', item)"
      @deleted="emit('deleted')"
      @viewed="emit('viewed')"
      @canceled="emit('canceled')"
  >
    <template v-for="ifield in entity.fields" :key="ifield.name" v-slot:[`field.${ifield.name}`]="{field, form, modelValue, setValue}">
      <slot :name="`field.${ifield.name}`" v-bind="{field, form, modelValue, setValue}">
      </slot>
    </template>
  </crud-route-form>

  <v-container v-else :id="`crud-container-${entity.name}`" :fluid="entity.containerFluid" class="crud mt-5">
    <v-card :id="`crud-card-${entity.name}`" :class="['crud__card', entity.cardClass]" :density="entity.cardDensity">

      <component
          :is="listComponent"
          :id="`crud-list-component-${entity.name}`"
          class="crud__list"
          :entity="entity"
          @create="onCreate"
          @edit="onEditAt"
          @delete="onDeleteAt"
          @export="doExport"
          @import="doImport"
          @view="onViewAt"
      >

        <template v-slot:toolbar-left>
          <slot name="toolbar-left">
          </slot>
        </template>

        <template v-slot:toolbar>
          <slot name="toolbar">
          </slot>
        </template>


        <template v-slot:toolbar-right>
          <slot name="toolbar-right">
          </slot>
        </template>

        <template v-slot:filters="{filters}" v-if="$slots.filters">
          <slot name="filters" v-bind="{filters}">
          </slot>
        </template>

        <template v-for="iFilter in entity.filters"
                  :key="iFilter.name"
                  v-slot:[`filter.${iFilter.name}`]="{filter, filterIndex}"
        >
          <slot v-if="$slots[`filter.${iFilter.name}`]"
                :name="`filter.${iFilter.name}`"
                v-bind="{filter, filterIndex}"
          />
        </template>

        <template v-for="header in entity.headers" :key="header.key" v-slot:[`item.${header.key}`]="{item, value}">
          <slot :name="`item.${header.key}`" v-bind="{item, value}">
            <crud-row-value
                :title="header.title || header.key"
                :value="value"
            />
          </slot>
        </template>

        <template  v-slot:item="{item}">
          <slot name="item" v-bind="{item}">
          </slot>
        </template>


        <template v-slot:item.actions="{item, index}">
          <slot name="item.actions" v-bind="{item, index}">
          </slot>
        </template>

        <template v-slot:export-table="{ exportFiles }">
          <slot name="export-table" :exportFiles="exportFiles">
          </slot>
        </template>

        <template v-slot:import-table="{ importFiles }">
          <slot name="import-table" :importFiles="importFiles">
          </slot>
        </template>

      </component>
    </v-card>

    <crud-dialog
        :id="`crud-dialog-${entity.name}`"
        class="crud__dialog"
        v-model="dialog"
        :entity="entity"
        :operation="operation"
    >
      <template #toolbar-actions>
        <crud-open-route-form-button
            v-if="entity.isRouteFormEnable && canOpenRouteCrudForm"
            id="crud-open-route-form-button"
            class="crud__open-route-form-button"
            @click="openRouteCrudForm"
        />

        <crud-dialog-prev-button
            v-if="canNavigateItems"
            id="crud-dialog-prev-button"
            class="crud__dialog-prev-button"
            :disabled="!canNavigatePrev"
            @click="navigateView(-1)"
        />

        <crud-dialog-next-button
            v-if="canNavigateItems"
            id="crud-dialog-next-button"
            class="crud__dialog-next-button"
            :disabled="!canNavigateNext"
            @click="navigateView(1)"
        />

        <crud-ai-button
            v-if="entity.isAiAssistable && ['create', 'edit'].includes(operation) && hasPermission('ai:promptCrud')"
            id="crud-ai-toggle-button"
            class="crud__ai-toggle-button"
            :entity="entity"
            v-model="aiExpanded"
        />
      </template>

      <slot name="tools">
        <crud-ai
            v-if="entity.isAiAssistable && ['create', 'edit'].includes(operation) && hasPermission('ai:promptCrud')"
            id="crud-ai"
            class="crud__ai"
            :entity="entity"
            v-model="aiExpanded"
            @apply="applyAiSuggestions"
        />

      </slot>

      <slot name="form" v-bind="{form, operation}">

        <crud-form
            id="crud-form-dialog"
            class="crud__form"
            :entity="entity"
            @created="item => emit('created', item)"
            @updated="item => emit('updated', item)"
            @deleted="emit('deleted')"
            @viewed="emit('viewed')"
            @canceled="emit('canceled')"
        >

          <template v-for="ifield in entity.fields" :key="ifield.name" v-slot:[`field.${ifield.name}`]="{field, form, modelValue, setValue}">
            <slot :name="`field.${ifield.name}`" v-bind="{field, form, modelValue, setValue}">
            </slot>
          </template>

        </crud-form>
      </slot>

    </crud-dialog>

    <crud-notify id="crud-notify" class="crud__notify" v-model="notify" :message="message"></crud-notify>
  </v-container>
</template>

<style scoped>

</style>
