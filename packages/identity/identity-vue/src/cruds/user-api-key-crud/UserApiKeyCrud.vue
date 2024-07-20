<script setup lang="ts">
import {computed, ref} from 'vue'
import UserApiKeyList from "./UserApiKeyList.vue";
import {useUserApiKey} from "../../composables/useUserApiKey";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import UserApiKeyForm from "../../forms/UserApiKeyForm.vue";
import UserApiKeyView from "../../views/UserApiKeyView.vue";

const {createUserApiKey, editUserApiKey, deleteUserApiKey, loading, userApiKeyError, inputErrors} = useUserApiKey()

interface UserApiKeyList {
  loadItems: () => void;
  items: IUserApiKey[];
}

type DialogMode = 'create' | 'edit' | 'delete' | null;


let dialog = ref(false);
let dialogMode = ref<DialogMode>(null);
let dialogTitle = ref('');
const userApiKeyList = ref<UserApiKeyList | null>(null);
let form = ref<IUserApiKeyBase>({name: ""})
let target = ref<IUserApiKey>();
let targetId = ref<string>('');
let filterEnable = ref(false);

let userApiKeyCreated = ref<IUserApiKey>();


function cancel() {
  dialog.value = false
  inputErrors.value = {}
  userApiKeyError.value = '';
  dialogMode.value = null
  dialogTitle.value = ''
  targetId.value = ''
  target.value = undefined
}

async function save() {

  try {
    if (dialogMode.value === 'create') {
      userApiKeyCreated.value = await createUserApiKey(form.value)

    } else if (dialogMode.value === 'edit') {
      await editUserApiKey(targetId.value, form.value)
    } else if (dialogMode.value === 'delete') {
      await deleteUserApiKey(targetId.value)
    }

    if(!userApiKeyCreated.value){
      dialog.value = false
    }

    inputErrors.value = {}
    userApiKeyError.value = '';
    if (userApiKeyList.value !== null) {
      userApiKeyList.value.loadItems()
    }
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      userApiKeyError.value = e.message
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
  dialogTitle.value = 'userApiKey.creating';
  form.value = {name: ""}
  dialog.value = true;
}

function toEdit(item: IUserApiKey) {
  console.log('toEdit', item)
  dialogMode.value = 'edit';
  dialogTitle.value = 'userApiKey.updating';
  targetId.value = item.id;
  form.value = {
    name: item.name
  }
  dialog.value = true;
}

function toDelete(item: IUserApiKey) {
  console.log('toDelete', item)
  dialogMode.value = 'delete';
  dialogTitle.value = 'userApiKey.deleting';
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
        <v-toolbar-title>{{ $t('userApiKey.managing') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="filterEnable = !filterEnable">
          <v-icon>{{ filterEnable ? 'mdi-filter' : 'mdi-filter-off' }}</v-icon>
        </v-btn>
        <v-btn class="font-weight-bold" color="primary" @click="toCreate">
          {{ $t('action.create') }}
        </v-btn>
      </v-toolbar>
      <v-theme-provider with-background class="pa-2 rounded-b">
        <UserApiKeyList
            ref="userApiKeyList"
            @toEdit="toEdit"
            @toDelete="toDelete"
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
          <v-card-text v-if="userApiKeyError">
            <v-alert type="error">{{ userApiKeyError }}</v-alert>
          </v-card-text>
          <v-card-text>
            <UserApiKeyForm v-if="dialogMode === 'create' || dialogMode === 'edit'"
                        v-model="form"
                        :inputErrors="inputErrors"
                        @formSubmit="save"
            />
            userApiKeyCreated:  {{userApiKeyCreated}}
            <UserApiKeyView v-if="dialogMode === 'delete' && target" :userApiKey="target"></UserApiKeyView>
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
