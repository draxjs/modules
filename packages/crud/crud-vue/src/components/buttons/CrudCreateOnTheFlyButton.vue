<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {defineProps, type PropType, ref} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import CrudForm from "../CrudForm.vue";
import CrudDialog from "../CrudDialog.vue";
import {useCrudStore} from "../../stores/UseCrudStore";
import {useCrud} from "../../composables/UseCrud";

const {t} = useI18n()

const dialog = ref(false)

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
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
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
             icon="mdi-plus"
             class="mr-1"
             variant="text"
             @click="openDialog"
      >
      </v-btn>
    </template>
    {{ t('action.create')}}
  </v-tooltip>

  <crud-dialog
      v-model="dialog"
      :entity="entity"
      operation="create"
      :fullscreen="false"
  >
    <crud-form
        :entity="entity"
        @created="onCreated"
        @canceled="onCanceled"

    >
    </crud-form>

  </crud-dialog>

</template>

<style scoped>

</style>
