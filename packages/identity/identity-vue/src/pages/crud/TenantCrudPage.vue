<script setup lang="ts">
import {useIdentityCrudStore} from "../../stores/IdentityCrudStore"
const identityCrudStore = useIdentityCrudStore();
import {Crud} from "@drax/crud-vue";
</script>

<template>
  <crud :entity="identityCrudStore.tenantCrud">

  </crud>
</template>

<style scoped>

</style>
