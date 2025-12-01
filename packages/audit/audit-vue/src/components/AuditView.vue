
<script setup lang="ts">
import { computed } from 'vue'
import type { IAudit } from '@drax/audit-share'

interface Props {
  audit: IAudit
}

const props = defineProps<Props>()

const actionColor = computed(() => {
  const actionMap: Record<string, string> = {
    'CREATE': 'success',
    'UPDATE': 'warning',
    'DELETE': 'error',
    'READ': 'info',
    'EXPORT': 'primary'
  }
  return actionMap[props.audit.action] || 'secondary'
})

const actionIcon = computed(() => {
  const iconMap: Record<string, string> = {
    'CREATE': 'mdi-plus-circle',
    'UPDATE': 'mdi-pencil-circle',
    'DELETE': 'mdi-delete-circle',
    'READ': 'mdi-eye-circle',
    'EXPORT': 'mdi-download-circle'
  }
  return iconMap[props.audit.action] || 'mdi-information-circle'
})

const formattedDate = computed(() => {
  if (!props.audit.createdAt) return 'N/A'
  return new Date(props.audit.createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const hasChanges = computed(() => {
  return props.audit.changes && props.audit.changes.length > 0
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <v-card class="audit-view-card" elevation="2">
    <!-- Header con acción y fecha -->
    <v-card-title class="d-flex align-center pa-4 bg-gradient">
      <v-icon :color="actionColor" size="32" class="mr-3">
        {{ actionIcon }}
      </v-icon>
      <div class="flex-grow-1">
        <div class="text-h6 font-weight-bold">
          {{ audit.action }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ formattedDate }}
        </div>
      </div>
      <v-chip :color="actionColor" variant="flat" size="small" class="font-weight-bold">
        {{ audit.entity }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <!-- Información General -->
      <div class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="primary" class="mr-2">mdi-information</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Información General</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <div class="info-row mb-4">
            <span class="info-label">Acción:</span>
            <v-chip :color="actionColor" variant="tonal" size="small" class="ml-2">
              {{ audit.action }}
            </v-chip>
          </div>
          <v-divider class="my-3" />
          <div class="info-row">
            <span class="info-label">Entidad:</span>
            <span class="info-value">{{ audit.entity }}</span>
          </div>
        </v-card>
      </div>

      <!-- Información del Usuario -->
      <div class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="primary" class="mr-2">mdi-account-circle</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Usuario</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <div class="info-row mb-4">
            <span class="info-label">Nombre de Usuario:</span>
            <span class="info-value">{{ audit.user.username }}</span>
          </div>
          <v-divider class="my-3" />
          <div class="info-row mb-4">
            <span class="info-label">Rol:</span>
            <v-chip size="small" color="primary" variant="tonal" class="ml-2">
              {{ audit.user.rolName }}
            </v-chip>
          </div>
          <v-divider class="my-3" />
          <div class="info-row">
            <span class="info-label">ID de Usuario:</span>
            <div class="d-flex align-center gap-2 ml-2">
              <span class="info-value font-monospace text-caption">{{ audit.user.id }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit.user.id)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Información de Conexión -->
      <div class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="info" class="mr-2">mdi-network</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Información de Conexión</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <div class="info-row mb-4">
            <span class="info-label">
              <v-icon size="x-small" class="mr-1">mdi-ip</v-icon>
              Dirección IP:
            </span>
            <div class="d-flex align-center gap-2 ml-2">
              <v-chip size="small" variant="tonal" color="info">
                {{ audit.ip }}
              </v-chip>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit.ip)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
          <v-divider class="my-3" />
          <div class="info-row">
            <span class="info-label">
              <v-icon size="x-small" class="mr-1">mdi-web</v-icon>
              User Agent:
            </span>
            <span class="info-value text-caption">{{ audit.userAgent }}</span>
          </div>
        </v-card>
      </div>

      <!-- Cambios Realizados -->
      <div v-if="hasChanges" class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="warning" class="mr-2">mdi-file-document-edit</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Cambios Realizados</span>
          <v-chip size="x-small" color="warning" variant="tonal" class="ml-2">
            {{ audit.changes?.length }} cambios
          </v-chip>
        </div>
        <v-card variant="outlined" class="overflow-hidden">
          <v-list lines="three" class="pa-0">
            <template v-for="(change, index) in audit.changes" :key="index">
              <v-list-item class="change-item">
                <template #prepend>
                  <v-avatar color="warning" size="40" class="font-weight-bold">
                    <v-icon size="small">mdi-swap-horizontal</v-icon>
                  </v-avatar>
                </template>
                <div class="w-100">
                  <v-list-item-title class="font-weight-bold text-base mb-3">
                    Campo: {{ change.field }}
                  </v-list-item-title>
                  <div v-if="change.old" class="mb-2">
                    <span class="info-label">Valor Anterior:</span>
                    <v-chip
                      size="small"
                      color="error"
                      variant="tonal"
                      class="font-monospace ml-2 mt-1"
                    >
                      <v-icon start size="x-small">mdi-minus</v-icon>
                      {{ change.old }}
                    </v-chip>
                  </div>
                  <div v-if="change.new">
                    <span class="info-label">Valor Nuevo:</span>
                    <v-chip
                      size="small"
                      color="success"
                      variant="tonal"
                      class="font-monospace ml-2 mt-1"
                    >
                      <v-icon start size="x-small">mdi-plus</v-icon>
                      {{ change.new }}
                    </v-chip>
                  </div>
                </div>
              </v-list-item>
              <v-divider v-if="index < audit.changes!.length - 1" />
            </template>
          </v-list>
        </v-card>
      </div>

      <!-- Detalles Adicionales -->
      <div v-if="audit.detail" class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="info" class="mr-2">mdi-text-box</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Detalles Adicionales</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <pre class="detail-text">{{ audit.detail }}</pre>
        </v-card>
      </div>

      <!-- Información del Tenant -->
      <div v-if="audit.tenant" class="mb-8">
        <div class="section-header mb-4">
          <v-icon color="secondary" class="mr-2">mdi-domain</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Tenant</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <div class="info-row mb-4">
            <span class="info-label">Nombre del Tenant:</span>
            <span class="info-value">{{ audit.tenant.name }}</span>
          </div>
          <v-divider class="my-3" />
          <div class="info-row">
            <span class="info-label">ID del Tenant:</span>
            <div class="d-flex align-center gap-2 ml-2">
              <span class="info-value text-caption font-monospace">{{ audit.tenant.id }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit.tenant.id)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- IDs de Sesión y Request -->
      <div>
        <div class="section-header mb-4">
          <v-icon color="grey" class="mr-2">mdi-identifier</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Identificadores de Sesión</span>
        </div>
        <v-card variant="outlined" class="pa-4">
          <div class="info-row mb-4">
            <span class="info-label">ID de Auditoría:</span>
            <div class="d-flex align-center gap-2 ml-2">
              <span class="info-value text-caption font-monospace">{{ audit._id }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit._id)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
          <v-divider class="my-3" />
          <div v-if="audit.sessionId" class="info-row mb-4">
            <span class="info-label">ID de Sesión:</span>
            <div class="d-flex align-center gap-2 ml-2">
              <span class="info-value text-caption font-monospace">{{ audit.sessionId }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit.sessionId)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
          <v-divider class="my-3" />
          <div v-if="audit.requestId" class="info-row">
            <span class="info-label">ID de Petición:</span>
            <div class="d-flex align-center gap-2 ml-2">
              <span class="info-value text-caption font-monospace">{{ audit.requestId }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyToClipboard(audit.requestId)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.audit-view-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.audit-view-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.bg-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface-variant)) 0%, rgb(var(--v-theme-surface)) 100%);
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.2);
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
}

.info-value {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.detail-text {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.change-item {
  transition: background-color 0.2s ease;
}

.change-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}
</style>
