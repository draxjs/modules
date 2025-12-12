<script setup lang="ts">

import type {ISetting} from "@drax/settings-share";
import {CrudAutocomplete, useEntityStore} from "@drax/crud-vue";
import {type PropType, ref, computed} from "vue";


const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})


const {setting, editing, variant} = defineProps({
  setting: {type: Object as PropType<ISetting>, required: true},
  editing: {type: Boolean as PropType<boolean>, default: false},
  variant: {type: String as PropType<'filled' | 'outlined' | 'underlined'>, default: 'filled'},
})

const visible = ref(false)

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

const entityStore = useEntityStore()

const getEntity = computed(() => {
  return (entity: string | undefined) => {
    return entity ? entityStore.getEntity(entity) : undefined
  }
})


</script>

<template>

  <!--string-->
  <v-text-field v-if="setting.type === 'string'"
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
                :hint="setting.description"
                :persistent-hint="!!setting.description"
  >
  </v-text-field>

  <!--longString-->
  <v-textarea v-if="setting.type === 'longString'"
              :rows="2"
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
              :hint="setting.description"
              :persistent-hint="!!setting.description"
  >
  </v-textarea>


  <!--password-->
  <v-text-field v-if=" setting.type === 'password' || setting.type === 'secret'"
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
                :hint="setting.description"
                :persistent-hint="!!setting.description"
  >
  </v-text-field>

  <!--number-->
  <v-text-field v-if="setting.type === 'number'"
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
                :hint="setting.description"
                :persistent-hint="!!setting.description"
  >
  </v-text-field>

  <!--boolean-->
  <v-checkbox v-if="setting.type === 'boolean'"
              :name="setting.key"
              :value="true"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :readonly="!editing"

              :variant="variant"
              :hint="setting.description"
              :persistent-hint="!!setting.description"
  >
  </v-checkbox>


  <!--enum-->
  <v-select v-if="setting.type === 'enum'"
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
            :hint="setting.description"
            :persistent-hint="!!setting.description"
  >
  </v-select>


  <!--stringList-->
  <v-combobox v-if="setting.type === 'stringList'"
              chips
              multiple
              :name="setting.key"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :readonly="!editing"

              :variant="variant"
              :hint="setting.description"
              :persistent-hint="!!setting.description"
  >
  </v-combobox>

  <!--numberList-->
  <v-combobox v-if="setting.type === 'numberList'"
              chips
              multiple
              :name="setting.key"
              v-model="valueModel"
              :label="setting.label"
              :placeholder="setting.label"
              color="secondary"
              :rules="validateNumberList"
              :readonly="!editing"

              :variant="variant"
              :hint="setting.description"
              :persistent-hint="!!setting.description"
  >
  </v-combobox>

  <!--enumList-->
  <v-select v-if="setting.type === 'enumList'"
            multiple
            chips
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
            :hint="setting.description"
            :persistent-hint="!!setting.description"
  >
  </v-select>

  <!--ref-->
<crud-autocomplete
    v-if="setting.type ==='ref'"
    v-model="valueModel"
    :entity="getEntity(setting.entity)"
    :field="{name: setting.key, type: 'ref', label: setting.label, default:null}"
></crud-autocomplete>

</template>

<style scoped>

</style>
