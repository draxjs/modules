<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDateTime } from '@drax/common-front';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const tab = ref('details');

const file = computed(() => props.modelValue);

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

const isImage = computed(() => file.value?.mimetype?.startsWith('image/'));
const isPdf = computed(() => file.value?.mimetype === 'application/pdf');

const fileIcon = computed(() => {
  if (isImage.value) return 'mdi-image';
  if (isPdf.value) return 'mdi-file-pdf-box';
  if (file.value?.mimetype?.includes('video')) return 'mdi-video';
  if (file.value?.mimetype?.includes('audio')) return 'mdi-music-box';
  if (file.value?.mimetype?.includes('zip') || file.value?.mimetype?.includes('compressed')) return 'mdi-folder-zip';
  return 'mdi-file';
});
</script>

<template>
  <v-card class="media-field-card mx-auto rounded-xl elevation-4" max-width="800">
    <div class="glass-header bg-primary pa-6 d-flex align-center">
      <v-avatar size="64" color="surface" class="mr-4 elevation-2 text-primary">
        <v-icon size="36">{{ fileIcon }}</v-icon>
      </v-avatar>
      <div>
        <h2 class="text-h5 font-weight-bold mb-1 header-title text-truncate" style="max-width: 600px;">
          {{ file?.filename || 'Unknown File' }}
        </h2>
        <div class="text-subtitle-2 opacity-80 d-flex align-center">
          <v-chip size="small" color="surface" variant="outlined" class="mr-2 font-weight-medium">
            {{ file?.extension?.toUpperCase() || 'FILE' }}
          </v-chip>
          {{ formatFileSize(file?.size) }}
        </div>
      </div>
    </div>

    <v-tabs
      v-model="tab"
      color="primary"
      align-tabs="center"
      class="border-b"
    >
      <v-tab value="details">
        <v-icon start>mdi-information-outline</v-icon>
        Detalles
      </v-tab>
      <v-tab value="preview" :disabled="!isImage && !isPdf && !file?.url">
        <v-icon start>mdi-eye-outline</v-icon>
        Vista Previa
      </v-tab>
    </v-tabs>

    <v-card-text class="pa-0">
      <v-window v-model="tab">
        <v-window-item value="details">
          <v-container class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-list class="bg-transparent" lines="two">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-file-document-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Nombre de Archivo</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap">{{ file?.filename }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-shape-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Tipo MIME</v-list-item-title>
                    <v-list-item-subtitle>{{ file?.mimetype || 'Desconocido' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-weight</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Tamaño</v-list-item-title>
                    <v-list-item-subtitle>{{ formatFileSize(file?.size) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-eye-circle-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Visualizaciones / Hits</v-list-item-title>
                    <v-list-item-subtitle>{{ file?.hits || 0 }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list class="bg-transparent" lines="two">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-calendar-plus</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Fecha de Creación</v-list-item-title>
                    <v-list-item-subtitle>{{ file?.createdAt ? formatDateTime(file.createdAt) : '-' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                   <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-eye-check-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Último Acceso</v-list-item-title>
                    <v-list-item-subtitle>{{ file?.lastAccess ? formatDateTime(file.lastAccess) : '-' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-clock-alert-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">Fecha de Expiración</v-list-item-title>
                    <v-list-item-subtitle :class="{'text-error': file?.expiresAt && new Date(file.expiresAt) < new Date(), 'text-warning': file?.expiresAt && new Date(file.expiresAt) >= new Date()}">
                      {{ file?.expiresAt ? formatDateTime(file.expiresAt) : 'Sin expiración' }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-tag-multiple-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium mb-1">Etiquetas</v-list-item-title>
                    <v-list-item-subtitle>
                      <template v-if="file?.tags && file.tags.length > 0">
                        <v-chip
                          v-for="(tag, index) in file.tags"
                          :key="index"
                          color="primary"
                          size="small"
                          class="mr-1 mb-1"
                          variant="tonal"
                        >
                          {{ tag }}
                        </v-chip>
                      </template>
                      <template v-else>
                        <span class="text-grey">Sin etiquetas</span>
                      </template>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            <v-row v-if="file?.description">
                <v-col cols="12">
                     <v-card class="bg-surface-variant rounded-lg pa-4" variant="tonal">
                        <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center text-primary">
                            <v-icon size="small" class="mr-2">mdi-text-box-outline</v-icon>
                            Descripción
                        </div>
                        <p class="text-body-2">{{ file.description }}</p>
                    </v-card>
                </v-col>
            </v-row>
          </v-container>
        </v-window-item>

        <v-window-item value="preview">
          <div class="preview-container bg-black d-flex align-center justify-center relative">
            <template v-if="isImage">
              <v-img
                :src="file?.url"
                max-height="600"
                contain
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </template>
            <template v-else-if="isPdf">
              <iframe
                :src="file?.url"
                width="100%"
                height="600"
                style="border: none;"
                title="Vista previa del PDF"
              ></iframe>
            </template>
            <template v-else>
              <div class="pa-10 text-center text-white">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-hidden</v-icon>
                <div class="text-h6">Vista previa no disponible</div>
                <div class="text-body-2 text-grey-lighten-1 mt-2">
                  No se puede generar una vista previa para este tipo de archivo.
                </div>
                <v-btn
                  v-if="file?.url"
                  :href="file?.url"
                  target="_blank"
                  color="primary"
                  variant="flat"
                  class="mt-6"
                  prepend-icon="mdi-download"
                >
                  Descargar Archivo
                </v-btn>
              </div>
            </template>
          </div>
        </v-window-item>
      </v-window>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions class="pa-4 d-flex justify-space-between bg-surface">
        <div class="d-flex align-center text-caption text-medium-emphasis">
            <v-icon size="small" class="mr-1">mdi-account-outline</v-icon>
            Creado por: <span class="font-weight-bold ml-1">{{ file?.createdBy?.username || 'Sistema' }}</span>
        </div>
        <div>
            <v-btn
                v-if="file?.url"
                :href="file?.url"
                target="_blank"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-open-in-new"
            >
                Abrir Externo
            </v-btn>
        </div>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.media-field-card {
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.glass-header {
  position: relative;
  overflow: hidden;
}

.glass-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%);
  pointer-events: none;
}

.header-title {
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.preview-container {
  min-height: 400px;
  width: 100%;
}

.v-list-item {
  padding-left: 0;
}
</style>
