<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
             icon="mdi-plus"
             class="mr-1"
             variant="text"
             color="primary"
      >
      </v-btn>
    </template>
    {{ t('action.create')}}
  </v-tooltip>
</template>

<style scoped>

</style>
