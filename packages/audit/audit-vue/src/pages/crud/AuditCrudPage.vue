
<script setup lang="ts">
import AuditCrud from '../../cruds/AuditCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import {EntityCombobox} from "@drax/crud-vue"
import AuditView from "../../components/AuditView.vue";
import {useI18n} from "vue-i18n";
import CrudFormField from "@drax/crud-vue/src/components/CrudFormField.vue";

const {t, te} = useI18n();
const store = useCrudStore();

</script>

<template>
  <crud :entity="AuditCrud.instance">

    <template v-slot:filter.entity="{filterIndex}">
     <entity-combobox
         v-model="store.filters[filterIndex].value"
         :clearable="true"
         density="compact"
         variant="outlined"
         hide-details
         disable-rules
         prepend-inner-icon="mdi-equal"
     />
    </template>

    <template v-slot:item.createdAt="{value}">
      {{ formatDateTime(value) }}
    </template>

    <template v-slot:item.user="{value}">
      {{ value.username }} ({{value.rolName}})
    </template>

    <template v-slot:item.tenant="{value}">
      {{ value?.name }}
    </template>

    <template v-slot:item.action="{value}">
      {{ te('audit.action.'+value) ? t('audit.action.'+value) : value }}
    </template>

    <template v-slot:item.entity="{value}">
      {{ te(value?.toLowerCase() + '.entity') ? t(value.toLowerCase() + '.entity') : value }}
    </template>

    <template v-slot:item.changes="{value}">
      <div v-if="value && value.length > 0" class="changes-container">
        <div v-for="(change, index) in value" :key="index" class="change-item">
          <span class="field-name">{{ change.field }}:</span>
          <span class="old-value">{{ change.old }}</span>
          <span class="arrow">→</span>
          <span class="new-value">{{ change.new }}</span>
        </div>
      </div>
      <span v-else class="no-changes">Sin cambios</span>
    </template>

    <template v-slot:form>
      <audit-view :audit="store.form"></audit-view>
    </template>
  </crud>
</template>

<style scoped>

</style>
