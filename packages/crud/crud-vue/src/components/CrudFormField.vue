<script setup lang="ts">
import {computed, ref} from "vue";
import type {PropType} from "vue";
import CrudFormList from "./CrudFormList.vue";
import CrudAutocomplete from "./CrudAutocomplete.vue";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../stores/UseCrudStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter} from "@drax/crud-share";
import {MediaField, MediaFullField} from "@drax/media-vue";

const {t, te} = useI18n()

const store = useCrudStore()

const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})

const {index, entity, field, disableRules, parentField} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField | IEntityCrudFilter | undefined>, required: true},
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  multiple: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  disableRules: {type: Boolean, default: false},
  parentField: {type: String, default: null, required: false},
  index: {type: Number, default: null, required: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
})


if (!field) {
  throw new Error("CrudFormField must be provided with a field object")
}

const show = ref(false)

const name = computed(() => index >= 0 ? `${parentField ? parentField + "_" : ""}${field.name}_${index}` : `${parentField ? parentField + "_" : ""}${field.name}`)

const label = computed(() => {
  const i18n = `${entity.name.toLowerCase()}.field.${field.label ? field.label : field.name}`
  return te(i18n) ? t(i18n) : field.label
})

const rules = computed(() => {
  if (disableRules) return undefined
  return entity.getRule(field.name) as any
})

const inputErrors = computed(() => {
      let sIndex = (index != null && index >= 0) ? `${index}.` : ''
      let name = parentField ? `${parentField}.${sIndex}${field.name}` : field.name
      return store.getFieldInputErrors(name).map((error: string) =>te(error) ? t(error) : error)
    }
)

defineEmits(['updateValue'])

</script>

<template>

  <div v-if="field && field.type">
    <v-text-field
        v-if="field.type === 'string'"
        type="text"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
    />

    <v-textarea
        v-if="field.type === 'longString'"
        :rows="field.rows || 5"
        type="text"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
    />

    <v-text-field
        v-if="field.type === 'password'"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        @update:modelValue="$emit('updateValue')"
        :type="show ? 'text' : 'password'"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="show = !show"
    />


    <v-combobox
        v-if="field.type === 'enum' && !field.noFilter"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :items="field.enum"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>


    <v-select
        v-if="field.type === 'enum' && field.noFilter"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :items="field.enum"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-select>



    <v-text-field
        v-if="field.type === 'number'"
        type="number"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <media-field
        v-if="field.type === 'file'"
        :name="name"
        :label="label"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <media-full-field
        v-if="field.type === 'fullFile'"
        :name="name"
        :label="label"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <v-switch
        v-if="field.type === 'boolean'"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        color="primary"
    />


    <v-date-input
        v-if="field.type === 'date'"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="(v) => {
          if(field.endOfDay){
            const date = new Date(v)
            date.setHours(23, 59, 59, 0)
            valueModel = date
          }
          $emit('updateValue')
        }"
        @click:clear="() => {valueModel = null;  $emit('updateValue');} "
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"

    >
      <template v-if="field.endOfDay && field.showEndOfDayChip !== false" v-slot:append-inner>
        <v-chip size="small">23:59</v-chip>
      </template>
    </v-date-input>

    <crud-autocomplete
        v-if="field.type === 'ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        :item-title="field?.refDisplay"
        v-model="valueModel"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :readonly="readonly"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <v-card v-if="field.type === 'object'" class="mt-3" variant="flat" border>

      <v-card-title class="text-h5">{{ field.label }}</v-card-title>
      <v-card-text>
        <crud-form-field
            v-for="oField in field.objectFields"
            :entity="entity"
            :field="oField"
            :parent-field="field.name"
            v-model="valueModel[oField.name]"
            :density="density"
            :variant="variant"
            :clearable="clearable"
            :hide-details="hideDetails"
            :single-line="singleLine"
            @updateValue="$emit('updateValue')"
            :prepend-icon="prependIcon"
            :append-icon="appendIcon"
            :prepend-inner-icon="prependInnerIcon"
            :append-inner-icon="appendInnerIcon"
        ></crud-form-field>
      </v-card-text>

    </v-card>

    <v-combobox
        v-if="field.type === 'array.string'"
        type="text"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :closable-chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>

    <v-combobox
        v-if="field.type === 'array.enum'"
        type="text"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model="valueModel"
        :items="field.enum"
        :multiple="true"
        :chips="true"
        :closable-chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>


    <crud-autocomplete
        v-if="field.type === 'array.ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        :item-title="field?.refDisplay"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        :rules="rules"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />


    <v-combobox
        v-if="field.type === 'array.number'"
        type="number"
        :name="name"
        :label="label"
        :hint="field.hint"
        :persistent-hint="field.persistentHint"
        v-model   ="valueModel"
        :multiple="true"
        :chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>


    <crud-form-list
        v-if="field.type === 'array.object'"
        :entity="entity"
        :field="field"
        v-model="valueModel"
        :readonly="readonly"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
    />

  </div>
</template>

<style scoped>

</style>
