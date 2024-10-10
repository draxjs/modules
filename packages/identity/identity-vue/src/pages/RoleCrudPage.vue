<script setup lang="ts">
import {Crud, useCrud} from "@drax/crud-vue";
import RoleCrud from "../cruds/role-crud/RoleCrud";
import RoleForm from "../forms/RoleForm.vue";
import {useI18n} from "vue-i18n";

const {t, te} = useI18n()

const {
  onCancel, onSubmit,form
} = useCrud(RoleCrud.instance);

</script>

<template>
  <crud :entity="RoleCrud.instance">

    <template v-slot:form>
      <role-form
          v-model="form"
          @submit="onSubmit"
          @cancel="onCancel"
      />
    </template>

    <template v-slot:item.permissions="{ value }">
      <v-chip
          v-for="permission in value"
          :key="permission" color="green"
          class="ma-1"
      >
        {{ te(`permission.${permission}`) ? t(`permission.${permission}`) : permission }}
      </v-chip>
    </template>

    <template v-slot:item.childRoles="{ value }">
      <v-chip
          v-if="value && value.length > 0"
          v-for="role in value"
          :key="role" color="blue"
          class="ma-1"
      >
        {{ role.name }}
      </v-chip>
    </template>

    <template v-slot:item.readonly="{ value }">
      <v-chip v-if="value" color="red">
        <v-icon class="mdi mdi-pencil-off-outline"></v-icon>
      </v-chip>
      <v-chip v-else color="green">
        <v-icon class="mdi mdi-pencil-outline"></v-icon>
      </v-chip>
    </template>

  </crud>
</template>

<style scoped>

</style>
