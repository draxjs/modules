<script setup lang="ts">
import type {PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";

const valueModel = defineModel({type: Array, default: () => []});

const {field} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField>, required: true},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: true},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
})

function newItem() {
  return field.objectFields ? field.objectFields.reduce((acc, field) => ({
    ...acc,
    [field.name]: field.default
  }), {}) : []
}

function getField(key: string): IEntityCrudField | undefined {
  return field.objectFields ? field.objectFields.find(field => field.name === key) : undefined;
}

function hasField(key: string): boolean {
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

    <v-card-title class="text-h5">{{ field.label }}</v-card-title>
    <v-card-text>
      <v-expansion-panels>
        <v-expansion-panel v-for="(item,index) in valueModel" :key="index">

          <v-expansion-panel-title>
            {{ index }} - {{valueModel[index][Object.keys(valueModel[index] as any)[0]]}}

            <template v-slot:actions="{expanded}">
              <v-icon>{{expanded ? "mdi-menu-down" : "mdi-menu-up"}}</v-icon>

              <v-btn v-if="!readonly" variant="text" @click="removeItem(index)" density="compact"  class="text-red text--darken-3">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>

          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <template v-for="key in Object.keys(item as Record<string, any>)" :key="key">
              <crud-form-field
                  v-if="hasField(key)"
                  :entity="entity"
                  :field="getField(key)"
                  v-model="(valueModel[index] as any)[key]"
                  :readonly="readonly"
                  :parentField="field.name"
                  :index="index"
                  :density="density"
                  :variant="variant"
                  :clearable="clearable"
                  :hide-details="hideDetails"
                  :single-line="singleLine"
                  @updateValue="$emit('updateValue')"
              />
            </template>
          </v-expansion-panel-text>

        </v-expansion-panel>
        <v-btn icon @click="addItem" class="text-blue text--darken-3">
          <v-icon>mdi-plus</v-icon>
        </v-btn>

      </v-expansion-panels>
    </v-card-text>


  </v-card>

</template>

<style scoped>

</style>
