<script setup lang="ts">

import type {ISetting} from "@drax/settings-share";
import {type PropType, ref, computed} from "vue";


const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})


const {setting, editing} = defineProps({
  setting: {type: Object as PropType<ISetting>, required: true},
  editing: {type: Boolean as PropType<boolean>, default: false}
})

const visible = ref(false)

const variant = computed(() => {
  return editing ? 'filled' : 'underlined'
})

const validateRegex = computed(() => {
  return [(val: any) => {
    if (!setting.regex) return true
    let regex = new RegExp(setting.regex)
    if (typeof val === 'string') {
      return regex.test(val) || 'Formato Invalido.'
    }
    if (Array.isArray(val)) {
      return val.every(v => regex.test(v)) || 'Formato Invalido.'
    }
    return true
  }]
})

const validateNumber = computed(() => {
  return [(val: any) => {
    let regex = new RegExp(/\d+/)
    return regex.test(val) || 'Formato Invalido. Solo se esperan números.'
  }]
})

const validateNumberList = computed(() => {
  return [(val: any) => {
    let regex = new RegExp(/\d+/)
    if (Array.isArray(val)) {
      return val.every((v: any) => regex.test(v)) || 'Formato Invalido. Solo se esperan números.'
    }
    return true
  }]
})


</script>

<template>

  <!--string-->
  <v-text-field v-if="setting.type === 'string'"
                prepend-icon="text_snippet"
                :name="setting.key"
                v-model="valueModel"
                :label="setting.label"
                :placeholder="setting.label"
                color="secondary"
                :rules="validateRegex"
                :prefix="setting.prefix"
                :suffix="setting.suffix"
                :readonly="!editing"
                :variant="variant"
  >
  </v-text-field>

  <!--longString-->
  <v-textarea v-if="setting.type === 'longString'"
              :rows="2"
              prepend-icon="text_snippet"
              :name="setting.key"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :rules="validateRegex"
              :prefix="setting.prefix"
              :suffix="setting.suffix"
              :readonly="!editing"
              :variant="variant"
  >
  </v-textarea>


  <!--password-->
  <v-text-field v-if=" setting.type === 'password'"
                prepend-icon="text_snippet"
                :name="setting.key"
                v-model="valueModel"
                :label="setting.label"
                :placeholder="setting.label"
                :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="visible =!visible"
                :type="visible ? 'text' : 'password'"
                color="secondary"
                :rules="validateRegex"
                :prefix="setting.prefix"
                :suffix="setting.suffix"
                :readonly="!editing"
                :variant="variant"
  >
  </v-text-field>

  <!--number-->
  <v-text-field v-if="setting.type === 'number'"
                prepend-icon="text_snippet"
                type="number"
                :name="setting.key"
                v-model.number="valueModel"
                :label="setting.label"
                :placeholder="setting.label"
                :rules="validateNumber"
                color="secondary"
                :prefix="setting.prefix"
                :suffix="setting.suffix"
                :readonly="!editing"
                :variant="variant"
  >
  </v-text-field>

  <!--boolean-->
  <v-checkbox v-if="setting.type === 'boolean'"
              prepend-icon="text_snippet"
              :name="setting.key"
              :value="true"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :readonly="!editing"
              :variant="variant"
  >
  </v-checkbox>


  <!--enum-->
  <v-select v-if="setting.type === 'enum'"
            prepend-icon="text_snippet"
            :name="setting.key"
            :items="setting.options"
            v-model="valueModel"
            :label="setting.label"
            :placeholder="setting.label"
            color="secondary"
            :prefix="setting.prefix"
            :suffix="setting.suffix"
            :readonly="!editing"
            :variant="variant"
  >
  </v-select>


  <!--stringList-->
  <v-combobox v-if="setting.type === 'stringList'"
              chips
              multiple
              prepend-icon="list"
              :name="setting.key"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :readonly="!editing"
              :variant="variant"
  >
  </v-combobox>

  <!--numberList-->
  <v-combobox v-if="setting.type === 'numberList'"
              chips
              multiple
              prepend-icon="list"
              :name="setting.key"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :rules="validateNumberList"
              :readonly="!editing"
              :variant="variant"
  >
  </v-combobox>

  <!--enumList-->
  <v-select v-if="setting.type === 'enumList'"
            multiple
            chips
            prepend-icon="text_snippet"
            :name="setting.key"
            :items="setting.options"
            v-model="valueModel"
            :label="setting.label"
            :placeholder="setting.label"
            color="secondary"
            :prefix="setting.prefix"
            :suffix="setting.suffix"
            :readonly="!editing"
            :variant="variant"
  >
  </v-select>

  <!--ref-->
  <!--        <v-select v-if="setting.type === 'ref'"-->
  <!--                  prepend-icon="list"-->
  <!--                  :name="setting.key"-->
  <!--                  setting-text="entityText"-->
  <!--                  setting-value="entityValue"-->
  <!--                  :settings="entityOptions"-->
  <!--                  v-model="valueModel"-->
  <!--                  :label="setting.label"-->
  <!--                  :placeholder="setting.label"-->
  <!--                  color="secondary">-->
  <!--        </v-select>-->

</template>

<style scoped>

</style>
