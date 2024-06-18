<script setup lang="ts">
import {computed, ref} from 'vue'
import UserList from "./UserList.vue";
import {useUser} from "../../composables/useUser";
import type {IUser} from "@drax/identity-front";
import type {IUserCreate, IUserUpdate} from "@drax/identity-front/src/interfaces/IUser";
import UserCreateForm from "../../forms/UserCreateForm.vue";
import UserEditForm from "../../forms/UserEditForm.vue";
import UserView from "../../views/UserView.vue";

const {createUser, editUser, deleteUser, loading, userError, inputErrors} = useUser()

interface UserList {
  loadItems: () => void;
  items: IUser[];
}

type DialogMode = 'create' | 'edit' | 'delete' | null;


let dialog = ref(false);
let dialogMode = ref<DialogMode>(null);
let dialogTitle = ref('');
const userList = ref<UserList | null>(null);
let createForm = ref<IUserCreate>({name: "", username: "", password: "", email: "", phone: "", role: "", active: true})
let editForm = ref<IUserUpdate>({name: "", username: "", email: "", phone: "", role: "", active: true})
let target = ref<IUser>();
let targetId = ref<string>('');

function cancel(){
  dialog.value = false
  inputErrors.value = {}
  userError.value = '';
  dialogMode.value = null
  dialogTitle.value = ''
  targetId.value = ''
  target.value = undefined
}

async function save() {

  try {
    if (dialogMode.value === 'create') {
      await createUser(createForm.value)
    } else if (dialogMode.value === 'edit') {
      await editUser(targetId.value, editForm.value)
    } else if (dialogMode.value === 'delete') {
      await deleteUser(targetId.value)
    }
    dialog.value = false
    inputErrors.value = {}
    userError.value = '';
    if (userList.value !== null) {
      userList.value.loadItems()
    }
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      userError.value = e.message
    }
  }
}

let buttonText = computed(() => {
  switch (dialogMode.value) {
    case 'create':
      return 'Crear'
    case 'edit':
      return 'Guardar'
    case 'delete':
      return 'Eliminar'
    default:
      return 'Enviar'
  }
})

function toCreate() {
  dialogMode.value = 'create';
  dialogTitle.value = 'Agregar Usuario';
  createForm.value = {name: "", username: "", password: "", email: "", phone: "", role: "", active: true}
  dialog.value = true;
}

function toEdit(item: IUser) {
  console.log('toEdit', item)
  dialogMode.value = 'edit';
  dialogTitle.value = 'Editando Usuario';
  const {id, ...rest} = item;
  targetId.value = id;
  rest.role = rest.role.id
  editForm.value = {...rest}
  dialog.value = true;
}

function toDelete(item: IUser) {
  console.log('toDelete', item)
  dialogMode.value = 'delete';
  dialogTitle.value = 'Eliminando Usuario';
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
        <v-toolbar-title>Administración de Usuarios</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="toCreate">Agregar</v-btn>
      </v-toolbar>
      <v-theme-provider with-background class="pa-2 rounded-b">
        <UserList ref="userList" @toEdit="toEdit" @toDelete="toDelete"/>
      </v-theme-provider>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="800">
      <v-sheet border>
        <v-toolbar>
          <v-toolbar-title>{{ dialogTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card class="pa-10">
          <v-card-text v-if="userError">
            <v-alert type="error">{{ userError }}</v-alert>
          </v-card-text>
          <v-card-text>
            <UserCreateForm v-if="dialogMode === 'create'" v-model="createForm"
                            :inputErrors="inputErrors"></UserCreateForm>
            <UserEditForm v-if="dialogMode === 'edit'" v-model="editForm" :inputErrors="inputErrors"></UserEditForm>
            <UserView v-if="dialogMode === 'delete' && target" :user="target"></UserView>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancel" :loading="loading">Cancelar</v-btn>
            <v-btn variant="flat"
                   :color="dialogMode==='delete' ? 'red' : 'primary'"
                   @click="save"
                   :loading="loading"
            >
              {{ buttonText }}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-sheet>
    </v-dialog>

  </v-container>
</template>

<style scoped>

</style>
