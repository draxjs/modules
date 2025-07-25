<script setup lang="ts">
import {onBeforeMount, type PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import CrudList from "./CrudList.vue";
import CrudForm from "./CrudForm.vue";
import CrudNotify from "./CrudNotify.vue";
import CrudDialog from "./CrudDialog.vue";
import {useCrud} from "../composables/UseCrud";

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  onView, onCreate, onEdit, onDelete, resetCrudStore,
  operation, dialog, notify, message, doExport,
  prepareFilters
} = useCrud(entity);

onBeforeMount(() => {
  resetCrudStore()
  prepareFilters()
})

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled'])


</script>

<template>
  <v-container :fluid="entity.containerFluid" class="mt-5">
    <v-card :class="entity.cardClass" :density="entity.cardDensity">

      <crud-list
          :entity="entity"
          @create="onCreate"
          @edit="onEdit"
          @delete="onDelete"
          @export="doExport"
          @view="onView"
      >

        <template v-slot:toolbar>
          <slot name="toolbar">
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
            {{ (Array.isArray(value) && value.length > 0) || !Array.isArray(value) ? value : '' }}
          </slot>
        </template>


        <template v-slot:item.actions="{item}">
          <slot name="item.actions" v-bind="{item}">
          </slot>
        </template>

      </crud-list>
    </v-card>

    <crud-dialog
        v-model="dialog"
        :entity="entity"
        :operation="operation"
    >
      <slot name="tools">

      </slot>

      <slot name="form">
        <crud-form
            :entity="entity"
            @created="item => emit('created', item)"
            @updated="item => emit('updated', item)"
            @deleted="emit('deleted')"
            @viewed="emit('viewed')"
            @canceled="emit('canceled')"
        >

          <template v-for="ifield in entity.fields" :key="ifield.name" v-slot:[`field.${ifield.name}`]="{field}">
            <slot :name="`field.${ifield.name}`" v-bind="{field}">
            </slot>
          </template>

        </crud-form>
      </slot>

    </crud-dialog>

    <crud-notify v-model="notify" :message="message"></crud-notify>
  </v-container>
</template>

<style scoped>

</style>
