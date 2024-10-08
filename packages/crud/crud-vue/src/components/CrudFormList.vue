<script setup lang="ts">
import type {PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {VDateInput} from "vuetify/lib/labs/VDateInput";

const valueModel = defineModel({type: Array, default: () => []});

const {field} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField>, required: true},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: true},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

function newItem() {
  return field.objectFields ? field.objectFields.reduce((acc, field) => ({...acc, [field.name]: field.default }), {}) : []
}

function getField(key: string):IEntityCrudField|undefined {
  return field.objectFields ? field.objectFields.find(field => field.name === key) : undefined;
}

function hasField(key: string):boolean {
  return field.objectFields ? field.objectFields.some(field => field.name === key) : false;
}

function addItem() {
  valueModel.value.push(newItem());
}

function removeItem(index: number) {
  valueModel.value.splice(index, 1);
}

defineEmits(['updateValue'])

</script>

<template>
  <v-card class="mt-3" variant="flat" border>

    <v-card-title class="text-h5">{{field.label}}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" v-for="(item,index) in valueModel" :key="index" class="text-right">
          <v-row dense align="center">
            <v-col cols="11">
              <template v-for="key in Object.keys(item as Record<string, any>)" :key="key">
                <crud-form-field
                    v-if="hasField(key)"
                    :entity="entity"
                    :field="getField(key)"
                    v-model="(valueModel[index] as any)[key]"
                    :readonly="readonly"
                    :index="index"
                    :density="density"
                    :variant="variant"
                    :clearable="clearable"
                    :hide-details="hideDetails"
                    :single-line="singleLine"
                    @updateValue="$emit('updateValue')"
                />
              </template>

            </v-col>
            <v-col cols="1">
              <v-btn v-if="!readonly" icon @click="removeItem(index)" small class="text-red text--darken-3">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-divider></v-divider>

        </v-col>
        <v-btn  icon @click="addItem" class="text-blue text--darken-3">
          <v-icon>mdi-plus</v-icon>
        </v-btn>

      </v-row>
    </v-card-text>


  </v-card>

</template>

<style scoped>

</style>
