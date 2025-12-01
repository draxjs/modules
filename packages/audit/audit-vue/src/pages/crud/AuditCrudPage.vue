
<script setup lang="ts">
import AuditCrud from '../../cruds/AuditCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import AuditView from "../../components/AuditView.vue";

const store = useCrudStore();

</script>

<template>
  <crud :entity="AuditCrud.instance">

    <template v-slot:item.createdAt="{value}">
      {{ formatDateTime(value) }}
    </template>

    <template v-slot:form>
      <audit-view :audit="store.form"></audit-view>
    </template>
  </crud>
</template>

<style scoped>

</style>

