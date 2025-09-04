<script setup lang="ts">
import {Crud, useCrud} from "@drax/crud-vue";
import RoleForm from "../../cruds/role-crud/RoleForm.vue";
import {useI18n} from "vue-i18n";
import {useIdentityCrudStore} from "../../stores/IdentityCrudStore"
const identityCrudStore = useIdentityCrudStore();
const {t, te} = useI18n()

const {
  onCancel, onSubmit,form
} = useCrud(identityCrudStore.roleCrud);

</script>

<template>
  <crud :entity="identityCrudStore.roleCrud">

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
