<script setup lang="ts">
import {MediaSystemFactory} from "@drax/media-front"
import {type PropType, ref} from "vue";

const mediaSystem = MediaSystemFactory.getInstance()

const valueModel = defineModel<any>({type: [String], default: false})

const {dir} = defineProps({
  prependIcon: {type: String, default: ''},
 // prependInnerIcon: {type: String, default: ''},
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
  accept: {type: String, default: '*'},
  errorMessages: {type: Array as PropType<string[]>, default: []},
  rules: {type: Array as PropType<any>, default: []},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
})

let fileInput = ref()

function onFileClick() {
  console.log('File clicked');
  fileInput.value.click();
  console.log('File clicked pass');
}


async function onFileChanged(e: Event) {
  if (e.target && (e.target as HTMLInputElement).files) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      const file = await mediaSystem.uploadFile(files[0],dir);
      valueModel.value = file.url;
    }
  }
}

</script>

<template>
  <div>
    <v-text-field
        type="text"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="errorMessages"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        prepend-inner-icon="mdi mdi-upload-circle"
        :append-icon="appendIcon"
        :prepend-icon="prependIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
        @click:prepend-inner="onFileClick"
    >

    </v-text-field>

    <input
        :accept="accept"
        ref="fileInput"
        class="d-none"
        type="file"
        @change="onFileChanged"
    >
  </div>

</template>

<style scoped>

</style>
