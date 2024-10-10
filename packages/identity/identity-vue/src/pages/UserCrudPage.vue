<script setup lang="ts">
import UserCrud from "../cruds/user-crud/UserCrud";
import {Crud} from "@drax/crud-vue";
</script>

<template>
  <crud :entity="UserCrud.instance">
    <template v-slot:item.active="{ value }" >
      <v-chip :color="value ? 'green':'red'" >
        {{ value ? 'Active' : 'Inactive' }}
      </v-chip>
    </template>
  </crud>
</template>

<style scoped>

</style>
