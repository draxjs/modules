<script setup lang="ts">
import type {PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";

const valueModel = defineModel({type: Array, default: () => []});

const {field} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField>, required: true},
  readonly: {type: Boolean, default: false},
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
