<script setup lang="ts">
import {computed, ref} from 'vue'
import UserList from "./UserList.vue";
import {useUser} from "../../composables/useUser";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IUserPassword} from "@drax/identity-front";
import UserCreateForm from "../../forms/UserCreateForm.vue";
import UserEditForm from "../../forms/UserEditForm.vue";
import UserPasswordForm from "../../forms/UserPasswordForm.vue";
import UserView from "../../views/UserView.vue";

const {createUser, editUser, changeUserPassword, deleteUser, loading, userError, inputErrors} = useUser()

interface UserList {
  loadItems: () => void;
  items: IUser[];
}

type DialogMode = 'create' | 'edit' | 'delete' | 'changePassword' | null;


let dialog = ref(false);
let dialogMode = ref<DialogMode>(null);
let dialogTitle = ref('');
const userList = ref<UserList | null>(null);
let createForm = ref<IUserCreate>({name: "", username: "", password: "", email: "", phone: "", role: "", tenant: "", active: true})
let editForm = ref<IUserUpdate>({name: "", username: "", email: "", phone: "", role: "", tenant: "", active: true})
let passwordForm = ref<IUserPassword>({newPassword: "", confirmPassword: ""})
let passwordChanged = ref(false);
let target = ref<IUser>();
let targetId = ref<string>('');
let actionButtonEnable = ref(true);
let filterEnable = ref(false);

function cancel() {
  dialog.value = false
  inputErrors.value = {}
  userError.value = '';
  dialogMode.value = null
  dialogTitle.value = ''
  targetId.value = ''
  target.value = undefined
  actionButtonEnable.value = true
}

async function save() {

  try {
    if (dialogMode.value === 'create') {
      await createUser(createForm.value)
    } else if (dialogMode.value === 'edit') {
      await editUser(targetId.value, editForm.value)
    } else if (dialogMode.value === 'changePassword') {
      if (passwordForm.value.newPassword === passwordForm.value.confirmPassword) {
        passwordChanged.value = await changeUserPassword(targetId.value, passwordForm.value.newPassword)
        actionButtonEnable.value = false
        return
      } else {
        return
      }
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
  actionButtonEnable.value = true
  dialogMode.value = 'create';
  dialogTitle.value = 'user.creating';
  createForm.value = {name: "", username: "", password: "", email: "", phone: "", role: "", tenant: "", active: true}
  dialog.value = true;
}

function toEdit(item: IUser) {
  actionButtonEnable.value = true
  dialogMode.value = 'edit';
  dialogTitle.value = 'user.updating';
  targetId.value = item.id;
  editForm.value = {
    name: item.name,
    username: item.username,
    email: item.email,
    phone: item.phone,
    role: item.role.id,
    tenant: item?.tenant?.id,
    active: item.active
  };
  dialog.value = true;
}

function toDelete(item: IUser) {
  actionButtonEnable.value = true
  dialogMode.value = 'delete';
  dialogTitle.value = 'user.deleting';
  target.value = item
  const {id} = item;
  targetId.value = id;
  dialog.value = true;
}

function toChangePassword(item: IUser) {
  actionButtonEnable.value = true
  dialogMode.value = 'changePassword';
  dialogTitle.value = 'user.changingPassword';
  target.value = item
  const {id} = item;
  targetId.value = id;
  dialog.value = true;
}


</script>

<template>
  <v-container fluid>

    <v-card border rounded>
      <v-toolbar class="bg-toolbar">
        <v-toolbar-title>{{ $t('user.managing') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="filterEnable = !filterEnable">
          <v-icon>{{ filterEnable ? 'mdi-filter' : 'mdi-filter-off' }}</v-icon>
        </v-btn>
        <v-btn color="primary" @click="toCreate">
          {{$t('action.create') }}
        </v-btn>
      </v-toolbar>
      <v-theme-provider with-background class="pa-2 rounded-b">
        <UserList
            ref="userList"
            @toEdit="toEdit"
            @toDelete="toDelete"
            @toChangePassword="toChangePassword"
            :filterEnable="filterEnable"
        />
      </v-theme-provider>
    </v-card>

    <v-dialog v-model="dialog" max-width="800">
      <v-sheet border>
        <v-toolbar>
          <v-toolbar-title>{{ dialogTitle ? $t(dialogTitle) : '-' }}</v-toolbar-title>
        </v-toolbar>
        <v-card class="pa-10">
          <v-card-text v-if="userError">
            <v-alert type="error">{{ userError }}</v-alert>
          </v-card-text>
          <v-card-text>
            <UserCreateForm
                v-if="dialogMode === 'create'"
                v-model="createForm"
                :inputErrors="inputErrors"
                @formSubmit="save"
            />

            <UserEditForm
                v-if="dialogMode === 'edit'"
                v-model="editForm"
                :inputErrors="inputErrors"
                @formSubmit="save"
            />

            <UserView v-if="dialogMode === 'delete'
            && target" :user="target"
            />


            <UserPasswordForm
                v-if="dialogMode === 'changePassword'&& target"
                v-model="passwordForm"
                :inputErrors="inputErrors"
                :passwordChanged="passwordChanged"
                @formSubmit="save"
            />


          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                variant="text"
                @click="cancel"
                :loading="loading">
              {{ actionButtonEnable ? $t('action.cancel') : $t('action.close') }}
            </v-btn>
            <v-btn
                v-if="actionButtonEnable"
                variant="flat"
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
