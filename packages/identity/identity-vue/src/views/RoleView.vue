<script setup lang="ts">
import type {PropType} from "vue";
import type {IRole} from "@drax/identity-share";
import { useI18n } from 'vue-i18n';
const { t, te } = useI18n();

defineProps({
  role:{
    type: Object as PropType<IRole>,
    required: true,
  }
})
</script>

<template>
  <v-sheet border class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="text-center">
      <h6 class="text-h6">{{te('role.name') ? t('role.name') : 'Name'}} : {{ role.name }}</h6>
      <h6 class="text-h6 text-grey">Permisos</h6>

      <v-chip v-for="permission in role.permissions"
              :key="permission" color="green"
              class="ma-1"
      >
        {{te(`permission.${permission}`) ? t(`permission.${permission}`) : permission }}
      </v-chip>
    </v-sheet>
  </v-sheet>

</template>

<style scoped>

</style>
