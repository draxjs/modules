<template>
  <div
    :class="['image-preview', { 'image-preview-small': small }]"
    @click="handleClick"
  >
    <!-- PDF Preview -->
    <div v-if="isPdf" class="pdf-preview">
      <v-icon size="64" color="red-darken-2">mdi-file-pdf-box</v-icon>
      <div class="pdf-filename">{{ image.filename }}</div>
    </div>

    <!-- Image Preview -->
    <v-img
      v-else
      :src="image.url"
      :alt="image.filename"
      class="preview-image fill-height"
    >
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
        </v-row>
      </template>
      <template v-slot:error>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-icon size="48" color="grey-lighten-2">mdi-image-broken</v-icon>
        </v-row>
      </template>
    </v-img>
    <div class="image-overlay">
      <v-icon size="32" color="white">mdi-magnify-plus</v-icon>
    </div>
  </div>

  <!-- Image/PDF Modal -->
  <v-dialog v-model="imageModal" max-width="95vw">
    <v-card class="image-modal-card">
      <v-card-title class="modal-header">
        <div class="modal-title">{{ image.filename }}</div>
        <v-spacer />
        <v-btn icon variant="text" @click="downloadImage" color="white">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="imageModal = false" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="modal-body">
        <!-- PDF Viewer -->
        <embed
          v-if="isPdf"
          :src="image.url"
          type="application/pdf"
          class="modal-pdf"
        />
        <!-- Image Viewer -->
        <img
          v-else
          :src="image.url"
          alt="Vista previa"
          class="modal-image"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface ImageFile {
  url: string
  filename: string
}

const props = defineProps<{
  image: ImageFile
  small?: boolean
}>()

const emit = defineEmits<{
  click: [url: string, filename: string]
}>()

const isPdf = computed(() => {
  const filename = props.image.filename?.toLowerCase() || ''
  const url = props.image.url?.toLowerCase() || ''
  return filename.endsWith('.pdf') || url.includes('.pdf')
})

const imageModal = ref(false)

function downloadImage() {
  if (!props.image.url) return
  const link = document.createElement('a')
  link.href = props.image.url
  const extension = isPdf.value ? '.pdf' : '.jpg'
  link.download = props.image.filename || `documento${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleClick() {
  imageModal.value = true
  emit('click', props.image.url, props.image.filename)
}
</script>

<style scoped>
.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background-color: rgba(var(--v-theme-surface), 1);
}

.image-preview-small {
  height: 140px;
}

.image-preview:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.theme--dark .image-preview {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12);
}

.theme--dark .image-preview:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.pdf-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #fee5e5 0%, #ffebeb 100%);
  padding: 16px;
}

.theme--dark .pdf-preview {
  background: linear-gradient(135deg, #3d1a1a 0%, #4d2020 100%);
}

.pdf-filename {
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

.image-modal-card {
  min-width: 90vw;
  max-width: 95vw;
  max-height: 95vh;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 16px 24px !important;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px !important;
  max-height: calc(95vh - 80px);
  overflow: auto;
}

.modal-image {
  max-width: 100%;
  max-height: calc(95vh - 120px);
  object-fit: contain;
  border-radius: 8px;
}

.modal-pdf {
  width: 100%;
  height: calc(95vh - 120px);
  min-height: 600px;
  border: none;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .modal-pdf {
    height: calc(95vh - 160px);
    min-height: 400px;
  }
}
</style>
