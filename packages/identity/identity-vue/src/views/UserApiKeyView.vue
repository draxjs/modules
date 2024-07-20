<script setup lang="ts">
import type {PropType} from "vue";
import type {IUserApiKey} from "@drax/identity-share";

defineProps({
  userApiKey:{
    type: Object as PropType<IUserApiKey>,
    required: true,
  }
})
</script>

<template>
  <v-sheet border class="position-relative d-flex justify-center align-center" height="150">
    <v-sheet class="text-center">
      <h6 class="text-h6">{{$t ? $t('userApiKey.name') : 'Name'}} : {{ userApiKey.name }}</h6>
    </v-sheet>
  </v-sheet>

</template>

<style scoped>

</style>
