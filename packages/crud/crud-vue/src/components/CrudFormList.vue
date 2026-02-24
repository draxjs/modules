<script setup lang="ts">
import {computed, type PropType, ref} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../stores/UseCrudStore";
import {useDisplay} from "vuetify"


const {t, te} = useI18n()
const valueModel = defineModel({type: Array, default: () => []});

const {field, entity} = defineProps({
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

const store = useCrudStore(entity?.name)

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
  const item = newItem()
  valueModel.value.push(item);
  menuSelect(item, valueModel.value.length - 1)
}

function removeItem(index: number) {
  if (indexSelected.value === index) {
    itemSelected.value = undefined
    indexSelected.value = undefined
  }
  valueModel.value.splice(index, 1);

}

const label = computed(() => {
  const i18n = `${entity.name.toLowerCase()}.field.${field.label ? field.label : field.name}`
  return te(i18n) ? t(i18n) : field.label
})

const hasError = computed(() => {
  return (index:number) => {
    const fieldListName = field.name + '.' + index
    return store.hasFieldListInputErrors(fieldListName)
  }

})

const itemSelected = ref()
const indexSelected = ref()

function menuSelect(item: any, index: number) {
  itemSelected.value = item
  indexSelected.value = index
}

const menuMaxHeight = computed(() => {
  return field.menuMaxHeight || '300px'
})

defineEmits(['updateValue'])

const {xs} = useDisplay()

</script>

<template>
  <v-card class="mt-3" variant="flat" border>

    <v-card-title class="text-h5">{{ label }}</v-card-title>

    <v-card-text v-if="field.arrayObjectUI === 'accordion' || xs">
      <v-expansion-panels>
        <v-expansion-panel v-for="(item,index) in valueModel" :key="index">

          <v-expansion-panel-title>
            <v-chip class="mr-2" :color="hasError(index) ? 'red':'teal'">{{ index }}</v-chip>
            {{//@ts-ignore
              valueModel[index][field?.arrayObjectShowField ?? Object.keys(valueModel[index] as any)[0]]
            }}

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


    <v-card-text v-else-if="field.arrayObjectUI === 'chips' ">
      <v-row dense>
        <v-col cols="12" sm="12" md="12">
          <v-card variant="flat">
            <v-card-text >
              <v-btn color="primary"   rounded="xl" @click="addItem"
                     class="text-blue text--darken-3 float-left mt-1 mr-2">
                <v-icon>mdi-plus</v-icon> {{ label }}
              </v-btn>


              <v-chip-group v-model="indexSelected"
                            :style="{ maxHeight: menuMaxHeight, overflowY: 'auto' }"
                            direction="horizontal"

              >

                <v-chip v-for="(item,index) in valueModel" :key="index"
                             :value="index" @click="menuSelect(item, index)"
                             label class="pr-0" :color="indexSelected === index ? 'primary' : ''"
                >
                    {{//@ts-ignore
                  valueModel[index][field?.arrayObjectShowField ?? Object.keys(valueModel[index] as any)[0]] || (index)
                    }}

                  <template v-slot:append>
                    <v-btn variant="text" class="ml-2" density="compact"
                           icon="mdi-close-circle"
                           @click="removeItem(index)"
                    ></v-btn>
                  </template>
                </v-chip>

              </v-chip-group>

            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="12">
          <v-card v-if="itemSelected" variant="flat">
            <v-card-text >
              <template v-for="key in Object.keys(itemSelected as Record<string, any>)" :key="key">
                <crud-form-field
                    v-if="hasField(key)"
                    :entity="entity"
                    :field="getField(key)"
                    v-model="(itemSelected as any)[key]"
                    :readonly="readonly"
                    :parentField="field.name"
                    :index="indexSelected"
                    :density="density"
                    :variant="variant"
                    :clearable="clearable"
                    :hide-details="hideDetails"
                    :single-line="singleLine"
                    @updateValue="$emit('updateValue')"
                />
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text v-else>
      <v-row>
        <v-col cols="12" sm="4" md="3">
          <v-card variant="outlined">
            <v-card-text >
              <v-list v-model="itemSelected" :style="{ maxHeight: menuMaxHeight, overflowY: 'auto' }">
                <v-list-item v-for="(item,index) in valueModel" :key="index" rounded="shaped"
                             :value="item" @click="menuSelect(item, index)"
                >
                  <template v-slot:append>
                    <v-btn size="x-small" variant="text" color="red" icon="mdi-delete"
                           @click="removeItem(index)"

                    />
                  </template>
                  <v-list-item-title>
                    <v-chip class="mr-2" :color="hasError(index) ? 'red':'teal'">{{ index }}</v-chip>
                    {{//@ts-ignore
                  valueModel[index][field?.arrayObjectShowField ?? Object.keys(valueModel[index] as any)[0]]
                    }}
                  </v-list-item-title>
                </v-list-item>

              </v-list>

              <v-btn variant="text" @click="addItem" class="text-blue text--darken-3 float-right my-2">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <v-card v-if="itemSelected" variant="outlined">
            <v-card-text >
              <template v-for="key in Object.keys(itemSelected as Record<string, any>)" :key="key">
                <crud-form-field
                    v-if="hasField(key)"
                    :entity="entity"
                    :field="getField(key)"
                    v-model="(itemSelected as any)[key]"
                    :readonly="readonly"
                    :parentField="field.name"
                    :index="indexSelected"
                    :density="density"
                    :variant="variant"
                    :clearable="clearable"
                    :hide-details="hideDetails"
                    :single-line="singleLine"
                    @updateValue="$emit('updateValue')"
                />
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

  </v-card>

</template>

<style scoped>

</style>
