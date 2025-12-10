<script setup lang="ts">
import {debounce} from "@drax/common-front"
import { type PropType, type Ref} from "vue";
import {ref, onBeforeMount} from "vue";
import {getItemId} from "../helpers/getItemId"
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";

const valueModel = defineModel<string | string[]>({type: [String, Array], required: false})

const {entity, multiple} = defineProps({
  entity: {type: Object as PropType<IEntityCrud|undefined>, required: true},
  field: {type: Object as PropType<IEntityCrudField>, required: true},
  prependIcon: {type: String},
  prependInnerIcon: {type: String},
  appendIcon: {type: String},
  appendInnerIcon: {type: String},
  multiple: {type: Boolean, default: false},
  chips: {type: Boolean, default: false},
  closableChips: {type: Boolean, default: true},
  readonly: {type: Boolean, default: false},
  clearable: {type: Boolean, default: true},
  label: {type: String},
  hint: {type: String},
  persistentHint: {type: Boolean, default: false},
  itemValue: {type: [String], default: '_id'},
  itemTitle: {type: [String], default: 'name'},
  rules: {type: Array as PropType<any>, default: () => []},
  errorMessages: {type: Array as PropType<string[]>, default: () => []},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

if(!entity){
  throw new Error('entity is required')
}

const loading: Ref<boolean> = ref(false)
const items: Ref<Array<any>> = ref([])

const debouncedSearch = debounce(search, 300)

async function search(value: any) {
  try{
    loading.value = true
    if(!entity){
      throw new Error('Entity is required')
    }
    if(!entity.provider.search){
      throw new Error('Provider does not have a search method')
    }
    items.value = await entity.provider.search(value)
  }catch (e){
    console.error(e)
  }finally{
    loading.value = false
  }

}

onBeforeMount(async () => {
  await search('')
  await checkIds()
})

async function checkIds(ids: Array<string> = []) {
  try{

    if(valueModel.value) {
      let ids = Array.isArray(valueModel.value) ? valueModel.value : [valueModel.value]
      for (let id of ids) {
        if (!items.value.some((item: any) => getItemId(item) === id)) {
          if (!entity) {
            throw new Error('CrudAutocomplete Entity is required')
          }
          if (!entity.provider) {
            throw new Error('CrudAutocomplete Provider is not defined')
          }
          if (typeof entity.provider.findById !== 'function') {
            throw new Error('CrudAutocomplete Provider does not have a findById method');
          }
          let item = await entity.provider.findById(id)
          items.value.push(item)
        }
      }
    }
  }catch (e){
    console.error(e)
  }
}

defineEmits(['updateValue'])

</script>

<template>

  <v-select
      v-if="field.noFilter === true"
      v-model="valueModel"
      :label="label ? label : field.label"
      :hint="field.hint"
      :persistent-hint="field.persistentHint"
      :placeholder="field.label"
      :items="items"
      :multiple="multiple"
      :chips="chips"
      :closable-chips="closableChips"
      :item-value="itemValue"
      :item-title="itemTitle"
      :loading="loading"
      :rules="rules"
      :readonly="readonly"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      :single-line="singleLine"
      :clearable="clearable"
      :error-messages="errorMessages"
      @update:modelValue="$emit('updateValue')"
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      :prepend-inner-icon="prependInnerIcon"
      :append-inner-icon="appendInnerIcon"
  >
    <template v-slot:item="{ props: itemProps, item }">
      <v-list-item
          v-bind="itemProps"
          density="compact"
          :title="item.raw[itemTitle]"
          :color="item.raw?.color"
          :base-color="item.raw?.color"
          :prepend-icon="item.raw?.icon"
      />
    </template>

    <template v-slot:selection="{item}">
      <v-chip tile density="compact"
              :color="item.raw?.color"
              :prepend-icon="item.raw?.icon"
      >
        {{ item.raw[itemTitle] }}
      </v-chip>
    </template>

  </v-select>


  <v-autocomplete
      v-else
      v-model="valueModel"
      :label="label ? label : field.label"
      :hint="field.hint"
      :persistent-hint="field.persistentHint"
      :placeholder="field.label"
      :items="items"
      :multiple="multiple"
      :chips="chips"
      :closable-chips="closableChips"
      :item-value="itemValue"
      :item-title="itemTitle"
      :loading="loading"
      :rules="rules"
      :readonly="readonly"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      :single-line="singleLine"
      :clearable="clearable"
      :error-messages="errorMessages"
      @update:search="debouncedSearch"
      @update:modelValue="$emit('updateValue')"
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      :prepend-inner-icon="prependInnerIcon"
      :append-inner-icon="appendInnerIcon"
  >
    <template v-slot:item="{ props: itemProps, item }">
      <v-list-item
          v-bind="itemProps"
          density="compact"
          :title="item.raw[itemTitle]"
          :color="item.raw?.color"
          :base-color="item.raw?.color"
          :prepend-icon="item.raw?.icon"
      />
    </template>

    <template v-slot:selection="{item}">
      <v-chip tile density="compact"
              :color="item.raw?.color"
              :prepend-icon="item.raw?.icon"
      >
        {{ item.raw[itemTitle] }}
      </v-chip>
    </template>

  </v-autocomplete>


</template>

<style scoped>

</style>
