<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {t} = useI18n()
</script>

<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-magnify"
          class="mr-1"
          variant="text"
          color="teal"
          slim
      >
      </v-btn>
    </template>
      {{ t('action.view')}}
  </v-tooltip>
</template>

<style scoped>

</style>
