<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {t} = useI18n()
</script>

<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-form-textbox-password"
          class="mr-1"
          variant="text"
          color="orange"
          slim
      >
      </v-btn>
    </template>
      {{ t('user.action.changePassword')}}
  </v-tooltip>
</template>

<style scoped>

</style>
