<script setup lang="ts">
import type {PropType} from "vue";
import type {ITenant} from "@drax/identity-share";
import { useI18n } from 'vue-i18n';
const { t, te } = useI18n();

defineProps({
  tenant:{
    type: Object as PropType<ITenant>,
    required: true,
  }
})
</script>

<template>
  <v-sheet border class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="text-center">
      <h6 class="text-h6">{{te('tenant.name') ? t('tenant.name') : 'Name'}} : {{ tenant.name }}</h6>
    </v-sheet>
  </v-sheet>

</template>

<style scoped>

</style>
