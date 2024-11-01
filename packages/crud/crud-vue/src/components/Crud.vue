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
  onView, onCreate, onEdit, onDelete, onCancel, onSubmit, resetCrudStore,
  operation, dialog, form, notify, error, message, doExport,
  prepareFilters
} = useCrud(entity);

onBeforeMount(() => {
  resetCrudStore()
  prepareFilters()
})

</script>

<template>
  <v-container fluid class="mt-5">
    <v-card>

      <crud-list
          :entity="entity"
          @create="onCreate"
          @edit="onEdit"
          @delete="onDelete"
          @export="doExport"
          @view="onView"
      >
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
            v-model="form"
            :entity="entity"
            :error="error"
            :operation="operation"
            :readonly="operation === 'delete'"
            @submit="onSubmit"
            @cancel="onCancel"
        />
      </slot>

    </crud-dialog>

    <crud-notify v-model="notify" :message="message"></crud-notify>
  </v-container>
</template>

<style scoped>

</style>
