<script setup lang="ts">

import SettingField from "./SettingField.vue";
import type {PropType} from "vue";
import {onMounted, ref} from "vue";
import type {ISetting} from "@drax/settings-share";
import {useSetting} from "../composables/UseSetting";


const {updateSettingValue} = useSetting()

const valueModel = defineModel<any>({type: [Boolean], default: false})

const {setting} = defineProps({
  setting: {type: Object as PropType<ISetting>, required: true}
})

const value = ref()
const loading = ref(false)

onMounted(() => {
  value.value = setting.value
})

const emit = defineEmits(['updateValue'])

async function updateValue() {
  try {
    loading.value = true
    await updateSettingValue(setting.id, value.value)
    emit('updateValue', value.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

</script>

<template>

  <v-dialog v-model="valueModel" max-width="500px">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>
          {{ setting.label }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-if="setting" ref="form" autocomplete="off" @submit.prevent>
          <v-row>
            <v-col cols="10">
              <setting-field
                  v-model="value"
                  :setting="setting"
                  editing
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="valueModel = false">Cancel</v-btn>
        <v-btn @click="updateValue" color="primary" :loading="loading">Save</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<style scoped>

</style>
