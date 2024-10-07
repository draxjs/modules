<script setup lang="ts">
import {computed, ref} from 'vue'
import TenantList from "./TenantList.vue";
import {useTenant} from "../../composables/useTenant";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import TenantForm from "../../forms/TenantForm.vue";
import TenantView from "../../views/TenantView.vue";
import {useI18n} from "vue-i18n";
const {t} = useI18n()
const {createTenant, editTenant, deleteTenant, loading, tenantError, inputErrors} = useTenant()

interface TenantList {
  loadItems: () => void;
  items: ITenant[];
}

type DialogMode = 'create' | 'edit' | 'delete' | null;


let dialog = ref(false);
let dialogMode = ref<DialogMode>(null);
let dialogTitle = ref('');
const tenantList = ref<TenantList | null>(null);
let form = ref<ITenantBase>({name: ""})
let target = ref<ITenant>();
let targetId = ref<string>('');
let filterEnable = ref(false);

function cancel() {
  dialog.value = false
  inputErrors.value = {}
  tenantError.value = '';
  dialogMode.value = null
  dialogTitle.value = ''
  targetId.value = ''
  target.value = undefined
}

async function save() {

  try {
    if (dialogMode.value === 'create') {
      await createTenant(form.value)
    } else if (dialogMode.value === 'edit') {
      await editTenant(targetId.value, form.value)
    } else if (dialogMode.value === 'delete') {
      await deleteTenant(targetId.value)
    }
    dialog.value = false
    inputErrors.value = {}
    tenantError.value = '';
    if (tenantList.value !== null) {
      tenantList.value.loadItems()
    }
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      tenantError.value = e.message
    }
  }
}

let buttonText = computed(() => {
  switch (dialogMode.value) {
    case 'create':
      return 'action.create'
    case 'edit':
      return 'action.update'
    case 'delete':
      return 'action.delete'
    default:
      return 'action.sent'
  }
})

function toCreate() {
  dialogMode.value = 'create';
  dialogTitle.value = 'tenant.creating';
  form.value = {name: ""}
  dialog.value = true;
}

function toEdit(item: ITenant) {
  console.log('toEdit', item)
  dialogMode.value = 'edit';
  dialogTitle.value = 'tenant.updating';
  targetId.value = item.id;
  form.value = {
    name: item.name
  }
  dialog.value = true;
}

function toDelete(item: ITenant) {
  console.log('toDelete', item)
  dialogMode.value = 'delete';
  dialogTitle.value = 'tenant.deleting';
  target.value = item
  const {id} = item;
  targetId.value = id;
  dialog.value = true;
}

</script>

<template>
  <v-container fluid>

    <v-card border rounded >
      <v-toolbar class="bg-toolbar">
        <v-toolbar-title>{{ t('tenant.managing') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="filterEnable = !filterEnable">
          <v-icon>{{ filterEnable ? 'mdi-filter' : 'mdi-filter-off' }}</v-icon>
        </v-btn>
        <v-btn class="font-weight-bold" color="primary" @click="toCreate">
          {{ t('action.create') }}
        </v-btn>
      </v-toolbar>
      <v-theme-provider with-background class="pa-2 rounded-b">
        <TenantList
            ref="tenantList"
            @toEdit="toEdit"
            @toDelete="toDelete"
            :filterEnable="filterEnable"
        />
      </v-theme-provider>
    </v-card>

    <v-dialog v-model="dialog" max-width="800">
      <v-sheet border>
        <v-toolbar>
          <v-toolbar-title>{{ dialogTitle ? t(dialogTitle) : '-' }}</v-toolbar-title>
        </v-toolbar>
        <v-card class="pa-10">
          <v-card-text v-if="tenantError">
            <v-alert type="error">{{ tenantError }}</v-alert>
          </v-card-text>
          <v-card-text>
            <TenantForm v-if="dialogMode === 'create' || dialogMode === 'edit'"
                        v-model="form"
                        :inputErrors="inputErrors"
                        @formSubmit="save"
            />
            <TenantView v-if="dialogMode === 'delete' && target" :tenant="target"></TenantView>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancel" :loading="loading">Cancelar</v-btn>
            <v-btn variant="flat"
                   :color="dialogMode==='delete' ? 'red' : 'primary'"
                   @click="save"
                   :loading="loading"
            >
              {{ t(buttonText) }}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-sheet>
    </v-dialog>

  </v-container>
</template>

<style scoped>

</style>
