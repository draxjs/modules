<script setup lang="ts">
import {computed, ref} from 'vue'
import RoleList from "./RoleList.vue";
import {useRole} from "../../composables/useRole";
import type {IRole} from "@drax/identity-front";
import RoleForm from "../../forms/RoleForm.vue";
import RoleView from "../../views/RoleView.vue";

const {createRole, editRole, deleteRole, loading, roleError, inputErrors} = useRole()

interface RoleList {
  loadItems: () => void;
  items: IRole[];
}

type DialogMode = 'create' | 'edit' | 'delete' | null;


let dialog = ref(false);
let dialogMode = ref<DialogMode>(null);
let dialogTitle = ref('');
const roleList = ref<RoleList | null>(null);
let form = ref<IRole>({name: "", permissions: [], readonly: false})
let target = ref<IRole>();
let targetId = ref<string>('');
let filterEnable = ref(false);

function cancel() {
  dialog.value = false
  inputErrors.value = {}
  roleError.value = '';
  dialogMode.value = null
  dialogTitle.value = ''
  targetId.value = ''
  target.value = undefined
}

async function save() {

  try {
    if (dialogMode.value === 'create') {
      await createRole(form.value)
    } else if (dialogMode.value === 'edit') {
      await editRole(targetId.value, form.value)
    } else if (dialogMode.value === 'delete') {
      await deleteRole(targetId.value)
    }
    dialog.value = false
    inputErrors.value = {}
    roleError.value = '';
    if (roleList.value !== null) {
      roleList.value.loadItems()
    }
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      roleError.value = e.message
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
  dialogTitle.value = 'role.creating';
  form.value = {name: "", permissions: [], readonly: false}
  dialog.value = true;
}

function toEdit(item: IRole) {
  console.log('toEdit', item)
  dialogMode.value = 'edit';
  dialogTitle.value = 'role.updating';
  const {id, ...rest} = item;
  targetId.value = id;
  form.value = {...rest}
  dialog.value = true;
}

function toDelete(item: IRole) {
  console.log('toDelete', item)
  dialogMode.value = 'delete';
  dialogTitle.value = 'role.deleting';
  target.value = item
  const {id} = item;
  targetId.value = id;
  dialog.value = true;
}

</script>

<template>
  <v-container>

    <v-sheet border rounded>
      <v-toolbar>
        <v-toolbar-title>{{$t('role.managing')}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="filterEnable = !filterEnable">
          <v-icon>{{ filterEnable ? 'mdi-filter' : 'mdi-filter-off' }}</v-icon>
        </v-btn>
        <v-btn color="primary" @click="toCreate">
          {{$t('action.create') }}
        </v-btn>
      </v-toolbar>
      <v-theme-provider with-background class="pa-2 rounded-b">
        <RoleList
            ref="roleList"
            @toEdit="toEdit"
            @toDelete="toDelete"
            :filterEnable="filterEnable"
        />
      </v-theme-provider>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="800">
      <v-sheet border>
        <v-toolbar>
          <v-toolbar-title>{{ $t(dialogTitle) }}</v-toolbar-title>
        </v-toolbar>
        <v-card class="pa-10">
          <v-card-text v-if="roleError">
            <v-alert type="error">{{ roleError }}</v-alert>
          </v-card-text>
          <v-card-text>
            <RoleForm v-if="dialogMode === 'create' || dialogMode === 'edit'"
                      v-model="form"
                      :inputErrors="inputErrors"
            />
            <RoleView v-if="dialogMode === 'delete' && target" :role="target"></RoleView>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancel" :loading="loading">Cancelar</v-btn>
            <v-btn variant="flat"
                   :color="dialogMode==='delete' ? 'red' : 'primary'"
                   @click="save"
                   :loading="loading"
            >
              {{ $t(buttonText) }}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-sheet>
    </v-dialog>

  </v-container>
</template>

<style scoped>

</style>
