<template>

  <!-- BLOQUE DE ATRIBUTOS EN COLUMNA -->
  <div class="text-body-2 mt-3">

    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.action') }}:</strong>
      <span>{{ audit.action }}</span>
    </div>

    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.entity') }}:</strong>
      <span>{{ audit.entity }}</span>
    </div>

    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.resourceId') }}:</strong>
      <span>{{ audit.resourceId }}</span>
    </div>


    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.user') }}:</strong>
      <span>{{ audit.user.username }}</span> <span v-if="audit.user.rolName"><{{ audit.user.rolName }}></span> <span>(ID {{
        audit.user.id
      }})</span>
    </div>

    <div
        v-if="audit.apiKey?.id"
        class="mb-1 audit-row"
    >
      <strong class="audit-label">{{ t('audit.field.apiKey') }}:</strong>
      <span>{{ audit.apiKey?.name }}</span> <span>(ID {{ audit.apiKey?.id }})</span>
    </div>

    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.ip') }}:</strong>
      <span>{{ audit.ip }}</span>
    </div>

    <div class="mb-1 audit-row">
      <strong class="audit-label">{{ t('audit.field.userAgent') }}:</strong>
      <span class="d-inline-block">
        {{ audit.userAgent }}
      </span>
    </div>

    <div
        v-if="audit.tenant"
        class="mb-1 audit-row"
    >
      <strong class="audit-label">{{ t('audit.field.tenant') }}:</strong>
      <span>{{ audit.tenant?.name }}</span><span v-if="audit.tenant.id">(ID {{ audit.tenant?.id }})</span>
    </div>


    <div
        class="mb-1 audit-row"
    >
      <strong class="audit-label">{{ t('audit.field.sessionId') }}:</strong>
      <span>{{ audit.sessionId }}</span>
    </div>

    <div
        v-if="audit.requestId"
        class="mb-1 audit-row"
    >
      <strong class="audit-label">{{ t('audit.field.requestId') }}:</strong>
      <span>{{ audit.requestId }}</span>
    </div>

    <div
        v-if="audit.createdAt"
        class="mb-1 audit-row"
    >
      <strong class="audit-label">{{ t('audit.field.createdAt') }}:</strong>
      <span>{{ formatDateTime(audit.createdAt) }}</span>
    </div>


  </div>

  <!-- DETAIL -->
  <v-row
      v-if="audit.detail"
      class="mt-2"
  >
    <v-col cols="12">
      <span class="font-weight-medium">{{ t('audit.field.detail') }}:</span>
      <v-sheet
          color="grey-lighten-4"
          rounded
          class="pa-3 text-body-2 mt-1"
      >
        {{ audit.detail }}
      </v-sheet>
    </v-col>
  </v-row>

  <!-- CAMBIOS REGISTRADOS (SIN PAGINACIÓN) -->
  <v-row
      v-if="audit.changes && audit.changes.length"
      class="mt-2"
  >
    <v-col cols="12">
      <span class="font-weight-medium">{{ t('audit.field.changes') }}</span>

      <v-data-table
          class="mt-2"
          density="compact"
          :headers="changeHeaders"
          :items="audit.changes"
          :items-per-page="-1"
          hide-default-footer
      >
        <template #item.old="{ item }">
          <span
              class="text-red-darken-2 text-body-2"
              style="white-space: pre-wrap; word-break: break-all;"
          >
            {{ item.old ?? '-' }}
          </span>
        </template>

        <template #item.new="{ item }">
          <span
              class="text-green-darken-2 text-body-2"
              style="white-space: pre-wrap; word-break: break-all;"
          >
            {{ item.new ?? '-' }}
          </span>
        </template>
      </v-data-table>
    </v-col>
  </v-row>

</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {formatDateTime} from '@drax/common-front'

interface IAudit {
  _id: string
  entity: string
  resourceId?: string
  user: {
    id: string
    username: string
    rolName: string
  }
  action: string
  ip: string
  userAgent: string
  changes?: Array<{
    field: string
    old?: string
    new?: string
  }>
  sessionId?: string
  requestId?: string
  detail?: string
  tenant?: {
    id: string
    name: string
  }
  apiKey?: {
    id: string
    name: string
  }
  createdAt?: Date
  updatedAt?: Date
}

const {t} = useI18n()

const props = defineProps<{
  audit: IAudit
}>()

const changeHeaders = [
  {title: t('audit.field.field'), key: 'field'},
  {title: t('audit.field.old'), key: 'old'},
  {title: t('audit.field.new'), key: 'new'},
]


</script>

<style scoped>
.audit-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.audit-label {
  min-width: 150px;
  text-align: right;
  flex-shrink: 0;
}
</style>
