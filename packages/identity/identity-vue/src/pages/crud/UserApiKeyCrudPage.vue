<script setup lang="ts">

import UserApiKeyCrud from "../../cruds/user-api-key-crud/UserApiKeyCrud";
import UserApiKeyForm from "../../cruds/user-api-key-crud/UserApiKeyForm.vue";
import {Crud, useCrud} from "@drax/crud-vue";
import type {IUserApiKey} from "@drax/identity-share";
import {formatDateTime} from "@drax/common-front";
import UserApiKeyCreated from "../../cruds/user-api-key-crud/UserApiKeyCreated.vue";
import {ref} from "vue";

const {
  onCancel, onSubmit,form
} = useCrud(UserApiKeyCrud.instance);

const userApiKeyCreated = ref<IUserApiKey>();
const userApiKeyCreatedDialog = ref<boolean>(false);

async function submit() {
  let result = await onSubmit(form.value)
  if(result.status === 'created'){
    onCreated(result.item);
  }
}

function onCreated(item:IUserApiKey) {
  console.log("User API Key created:", item);
  userApiKeyCreated.value = item;
  userApiKeyCreatedDialog.value = true;
}

</script>

<template>
  <div>
    <user-api-key-created
        v-if="userApiKeyCreated"
        :user-api-key="userApiKeyCreated"
        v-model="userApiKeyCreatedDialog"
    />

  <crud :entity="UserApiKeyCrud.instance" @created="onCreated">

    <template v-slot:form>
      <user-api-key-form
          v-model="form"
          @submit="submit"
          @cancel="onCancel"
      />
    </template>

    <template v-slot:item.ipv4="{ value }" >
      <v-chip v-for="(ip,index) in value" :key="index">{{ip}}</v-chip>
    </template>

    <template v-slot:item.ipv6="{ value }" >
      <v-chip v-for="(ip,index) in value" :key="index">{{ip}}</v-chip>
    </template>

    <template v-slot:item.createdAt="{ value }" >
      {{formatDateTime(value)}}
    </template>

    <template v-slot:item.createdBy="{ value }" >
      {{value ? value.name : 'Unknown' }}
    </template>


    <template v-slot:item.user="{ value }" >
      {{value.username }}
    </template>

  </crud>

  </div>


</template>

<style scoped>

</style>
