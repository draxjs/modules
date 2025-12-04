
<script setup lang="ts">
import AuditCrud from '../../cruds/AuditCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import AuditView from "../../components/AuditView.vue";
import {ref} from "vue";
import AuditDashboard from "../../components/AuditDashboard.vue";
import {useI18n} from "vue-i18n";

const {t, te} = useI18n();
const store = useCrudStore();
const tabSelected = ref('crud');

</script>

<template>
    <v-tabs v-model="tabSelected">
      <v-tab value="crud">
        {{ t('audit.crud') }}
      </v-tab>
      <v-tab value="dashboard">
        {{ t('audit.dashboard') }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tabSelected">
      <v-tabs-window-item value="crud">
        <crud :entity="AuditCrud.instance">

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
      </v-tabs-window-item>

      <v-tabs-window-item value="dashboard">
         <audit-dashboard></audit-dashboard>
      </v-tabs-window-item>
    </v-tabs-window>
</template>

<style scoped>

</style>
