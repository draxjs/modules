<script setup lang="ts">
import {MediaSystemFactory} from "@drax/media-front"
import {type PropType, ref} from "vue";

const mediaSystem = MediaSystemFactory.getInstance()

const valueModel = defineModel<any>({type: [String], default: false})

const {dir, readonly, timeout} = defineProps({
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  disableRules: {type: Boolean, default: false},
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
})

let fileInput = ref()

let loading = ref(false)
let errorMessage = ref()

function onFileClick() {
  if(readonly){
    return;
  }
  fileInput.value.click();
}


async function onFileChanged(e: Event) {
  if (e.target && (e.target as HTMLInputElement).files) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      try{
        errorMessage.value = null
        loading.value = true;
        const file = await mediaSystem.uploadFile(files[0],dir, timeout);
        valueModel.value = file.url;
      }catch (error) {
        console.error(error);
        if(error instanceof Error){
          errorMessage.value = error.message;
        }
      }finally {
        loading.value = false;
      }

    }
  }
}

const handleDrop = async (event: DragEvent) => {
  if(readonly){
    return;
  }
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files[0]) {
    const file = await mediaSystem.uploadFile(files[0],dir);
    valueModel.value = file.url;
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
        v-model="valueModel"
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

    <v-btn  @click="onFileClick" :loading="loading" density="compact" color="grey" variant="text">Click | Drag & Drop</v-btn>

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
