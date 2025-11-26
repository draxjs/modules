<script setup lang="ts">
import {ref} from "vue"
import UserCrud from "../../cruds/user-crud/UserCrud";
import {useAuth} from "../../composables/useAuth";
import {Crud, useCrud} from "@drax/crud-vue";
import UserForm from "../../cruds/user-crud/UserForm.vue";
import PasswordUpdateButton from "../../cruds/user-crud/PasswordUpdateButton.vue";
import UserPasswordDialog from "../../cruds/user-crud/UserPasswordDialog.vue";
import type {IUser} from "@drax/identity-share";
import {useIdentityCrudStore} from "../../stores/IdentityCrudStore"
import IdentityUserGroupBy from "../../components/IdentityUserGroupBy/IdentityUserGroupBy.vue";

const identityCrudStore = useIdentityCrudStore();

const {onCancel, onSubmit, form } = useCrud(UserCrud.instance);

const dialogPassword = ref(false);
const userSelected = ref();

const {hasPermission } = useAuth();

function onChangePassword(user:IUser){
  console.log("onChangePassword for user: ", user);
  userSelected.value = user;
  dialogPassword.value = true;
}

const roleDashboard = import.meta.env.VITE_DRAX_USER_ROLE_DASHBOARD === 'ENABLE'

</script>

<template>
  <v-container fluid>
    <user-password-dialog
        v-if="dialogPassword && userSelected"
        v-model="dialogPassword"
        :user="userSelected"
    />

    <identity-user-group-by v-if="roleDashboard"></identity-user-group-by>

    <crud :entity="identityCrudStore.userCrud">

      <template v-slot:form>
        <user-form
            v-model="form"
            @submit="onSubmit"
            @cancel="onCancel"
        />
      </template>

      <template v-slot:item.avatar="{ item }">
        <v-avatar>
          <v-img v-if="(item as IUser).avatar" :src="(item as IUser).avatar"></v-img>
          <v-icon v-else size="50">mdi-account-circle</v-icon>
        </v-avatar>
      </template>

      <template v-slot:item.role="{ item }">
       <v-chip  variant="outlined" :color="(item as IUser).role.color"> <v-icon v-if="(item as IUser).role.icon" start>{{(item as IUser).role.icon}}</v-icon>{{(item as IUser).role.name}}</v-chip>
      </template>



      <template v-slot:item.actions="{ item }">
        <password-update-button v-if="hasPermission('user:changePassword')"
                                @click="onChangePassword(item as IUser)"
        ></password-update-button>
      </template>


      <template v-slot:item.active="{ value }" >
        <v-chip :color="value ? 'green':'red'" >
          {{ value ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>
    </crud>
  </v-container>

</template>

<style scoped>

</style>
