<script setup lang="ts">
import {useI18n} from "vue-i18n";
import { type PropType, ref} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import CrudForm from "../CrudForm.vue";
import CrudDialog from "../CrudDialog.vue";
import {useCrudStore} from "../../stores/UseCrudStore";
import {useCrud} from "../../composables/UseCrud";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("createOnTheFly")

const dialog = ref(false)

const {entity, icon, label} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  icon: {type: String},
  label: {type: String},
})

const store = useCrudStore(entity?.name)
store.$reset()
const {onCreate} = useCrud(entity)

function openDialog() {
  onCreate()
  dialog.value = true
}

function onCreated(item: any) {
  dialog.value = false
  emit('created', item)
}

function onCanceled() {
  dialog.value = false
}

const emit = defineEmits(['created'])

</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-create-on-the-fly-button'}-tooltip`" class="crud-create-on-the-fly-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
             :icon="label ? undefined : icon || buttonConfig.icon"
             :id="$attrs.id || 'crud-create-on-the-fly-button'"
             class="crud-create-on-the-fly-button mr-1"
             :variant="buttonConfig.variant"
             :rounded="buttonConfig.rounded"
             :color="buttonConfig.color"
             @click="openDialog"
      >
        <template v-if="label">
          <v-icon
              v-if="icon || buttonConfig.icon"
              :icon="icon || buttonConfig.icon"
              start
          />
          {{ label }}
        </template>
      </v-btn>
    </template>
    {{ t('action.create')}}
  </v-tooltip>

  <crud-dialog
      id="crud-create-on-the-fly-dialog"
      class="crud-create-on-the-fly-dialog"
      v-model="dialog"
      :entity="entity"
      operation="create"
      :fullscreen="false"
  >
    <crud-form
        id="crud-create-on-the-fly-form"
        class="crud-create-on-the-fly-form"
        :entity="entity"
        @created="onCreated"
        @canceled="onCanceled"

    >
    </crud-form>

  </crud-dialog>

</template>

<style scoped>

</style>
