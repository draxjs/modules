<script setup lang="ts">
import {ref} from "vue"
import UserCrud from "../../cruds/user-crud/UserCrud";
import {Crud, useCrud} from "@drax/crud-vue";
import UserForm from "../../cruds/user-crud/UserForm.vue";
import PasswordUpdateButton from "../../cruds/user-crud/PasswordUpdateButton.vue";
import UserPasswordDialog from "../../cruds/user-crud/UserPasswordDialog.vue";
import type {IUser} from "@drax/identity-share";

const {onCancel, onSubmit,form, operation } = useCrud(UserCrud.instance);

const dialogPassword = ref(false);
const userSelected = ref();

function onChangePassword(user:IUser){
  console.log("onChangePassword for user: ", user);
  userSelected.value = user;
  dialogPassword.value = true;
}

</script>

<template>
  <div>
    <user-password-dialog
        v-if="dialogPassword && userSelected"
        v-model="dialogPassword"
        :user="userSelected"
    />

    <crud :entity="UserCrud.instance">

      <template v-slot:form>
        <user-form
            :enable-password="operation === 'create'"
            :operation="operation"
            v-model="form"
            @submit="onSubmit"
            @cancel="onCancel"
        />
      </template>



      <template v-slot:item.actions="{ item }">
        <password-update-button @click="onChangePassword(item as IUser)"></password-update-button>
      </template>


      <template v-slot:item.active="{ value }" >
        <v-chip :color="value ? 'green':'red'" >
          {{ value ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>
    </crud>
  </div>

</template>

<style scoped>

</style>
