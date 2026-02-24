<script setup lang="ts">
import {MediaSystemFactory} from "@drax/media-front"
import {type PropType, ref, computed} from "vue";

const mediaSystem = MediaSystemFactory.getInstance()

const valueModel = defineModel<any>({
  type: Object,
  default: () => ({filename: '', filepath: '', size: 0, mimetype: '', url: ''})
})

const {dir, readonly, timeout} = defineProps({
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
  readonly: {type: Boolean, default: true},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  parentField: {type: String, default: null, required: false},
  index: {type: Number, default: null, required: false},
  name: {type: String, default: 'file'},
  dir: {type: String, default: 'files'},
  label: {type: String, default: 'media.file'},
  timeout: {type: Number, default: 360000},
  accept: {type: String, default: '*'},
  errorMessages: {type: Array as PropType<string[]>, default: () => []},
  rules: {type: Array as PropType<any>, default: () => []},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
  preview: {type: Boolean, default: false},
  previewHeight: {type: String, default: '100px'},
})

let fileInput = ref()
let loading = ref(false)
let errorMessage = ref()

function onFileClick() {
  if (readonly) {
    return;
  }
  fileInput.value.click();
}

const valueModelUrl = computed(() =>
    valueModel.value?.url || '')

async function onFileChanged(e: Event) {
  if (e.target && (e.target as HTMLInputElement).files) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      try {
        errorMessage.value = null
        loading.value = true;
        const file = await mediaSystem.uploadFile(files[0], dir, timeout);
        valueModel.value = file;
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          errorMessage.value = error.message;
        }
      } finally {
        loading.value = false;
      }
    }
  }
}

const handleDrop = async (event: DragEvent) => {
  if (readonly) {
    return;
  }
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files[0]) {
    const file = await mediaSystem.uploadFile(files[0], dir);
    valueModel.value = file;
  }
};

const isDragOver = ref(false);

const handleDragEnter = () => {
  isDragOver.value = true;
};

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

defineEmits(['updateValue'])

const isImage = computed(() => {

  if (valueModel.value && (typeof valueModel.value?.url !== 'string' || !valueModel.value?.url.trim())) return false;

  // supports optional query/hash: ".../file.jpg?x=1#y"
  const imageExtRegex = /\.(?:jpe?g|png|gif|webp|bmp|svg|tiff?|avif|ico)(?:[?#].*)?$/i;

  return imageExtRegex.test(valueModel.value?.url);
});

</script>

<template>
  <div
      :class="{ 'drop-zone': true, 'dragover': isDragOver }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
  >

    <v-alert v-if="errorMessage" type="error" closable>{{ errorMessage }}</v-alert>

    <v-text-field
        type="text"
        :name="name"
        :label="label"
        v-model="valueModelUrl"
        :readonly="true"
        :error-messages="errorMessages"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :prepend-inner-icon="prependInnerIcon"
        :append-icon="appendIcon"
        :prepend-icon="prependIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
        @click:prepend-inner="onFileClick"
        :loading="loading"
    >

    </v-text-field>

    <input
        :accept="accept"
        ref="fileInput"
        class="d-none"
        type="file"
        @change="onFileChanged"
    >

    <v-btn @click="onFileClick" :loading="loading" density="compact" color="grey" variant="text">Click | Drag & Drop</v-btn>

    <template v-if="preview && isImage">
      <v-img :src="valueModel?.url" alt="Preview" :height="previewHeight" class="mt-4"></v-img>
    </template>

  </div>

</template>

<style scoped>
.drop-zone {
  border: 2px dashed #ccc;
  padding: 10px;
  text-align: center;
  color: #666;
  transition: background-color 0.3s;
}

.drop-zone.dragover {
  background-color: #e0f7fa;
  border-color: #00acc1;
}
</style>
