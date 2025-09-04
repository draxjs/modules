<script setup lang="ts">
import {ref} from "vue"
import TenantCombobox from "../../combobox/TenantCombobox.vue";
import {useAuth} from "../../composables/useAuth"
import {useAuthStore} from "../../stores/AuthStore"
import {useI18n} from "vue-i18n"

const authStore = useAuthStore()
const {switchTenant, hasPermission} = useAuth()

const {t} = useI18n()
const tenant = ref();

async function changeTenant() {
  await switchTenant(tenant.value)
  window.location.reload();
}

</script>

<template>
  <v-toolbar v-if="hasPermission('user:switchTenant')">
    <v-toolbar-title>
      <b>{{t('tenant.current')}}:</b> {{authStore.authUser?.tenant ? authStore.authUser?.tenant?.name : '-'}}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <tenant-combobox v-model="tenant" hide-details variant="outlined" density="compact" clearable ></tenant-combobox>
    <v-btn size="small" @click="changeTenant">{{t('action.change')}}</v-btn>
  </v-toolbar>

</template>

<style scoped>

</style>
