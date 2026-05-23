<script setup lang="ts">
import {computed, ref} from "vue";
import type {ValidationRule} from "vuetify"
import type {PropType} from "vue";
import CrudFormList from "./CrudFormList.vue";
import CrudAutocomplete from "./CrudAutocomplete.vue";
import CrudFormRecord from "./CrudFormRecord.vue";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../stores/UseCrudStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter} from "@drax/crud-share";
import {useAuth} from "@drax/identity-vue";

//TODO: Ver si esto no puede traer problemas...
import MediaField from "@drax/media-vue/src/components/MediaField.vue";
import MediaFullField from "@drax/media-vue/src/components/MediaFullField.vue";


const {t, te} = useI18n()

const {hasPermission} = useAuth()

const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})

const {index, entity, field, parentField, errorMessages, rules, onInput, readonly, hideDetails} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField | IEntityCrudFilter | undefined>, required: true},
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  hint: {type: String, required: false},
  persistentHint: {type: Boolean, default: false},
  placeholder: {type: String, required: false},
  persistentPlaceholder: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  multiple: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  preview: {type: Boolean, default: true},
  previewHeight: {type: String, default: '100px'},
  parentField: {type: String, default: null, required: false},
  errorMessages: {type: Array as PropType<string[]>, default: null, required: false},
  onInput: {type: Function as PropType<Function>, required: false},
  rules: {type: Array as PropType<ValidationRule[]>, required: false},
  index: {type: Number, default: null, required: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
})

const store = useCrudStore(entity?.name)


if (!field) {
  throw new Error("CrudFormField must be provided with a field object")
}

const show = ref(false)

const name = computed(() => index >= 0 ? `${parentField ? parentField + "_" : ""}${field.name}_${index}` : `${parentField ? parentField + "_" : ""}${field.name}`)

const label = computed(() => {
  const i18n = `${entity.name.toLowerCase()}.field.${field.label ? field.label : field.name}`
  return te(i18n) ? t(i18n) : field.label
})


const storeErrorMessages = computed(() => {
      let sIndex = (index != null && index >= 0) ? `${index}.` : ''
      let name = parentField ? `${parentField}.${sIndex}${field.name}` : field.name
      return store.getFieldInputErrors(name).map((error: string) => te(error) ? t(error) : error)
    }
)

const inputErrors = computed(() => {
  return errorMessages ?? storeErrorMessages.value
})

defineEmits(['updateValue'])

const hasHideDetails = computed(() => {
  if (readonly) {
    return true
  } else {
    return hideDetails ?? field.hideDetails
  }

})

</script>

<template>

  <div v-if="field && field.type && (!field.permission || hasPermission(field.permission) )" :id="`crud-form-field-${name}`" :class="['crud-form-field', `crud-form-field--${field.type.replace(/\./g, '-')}`]">
    <v-text-field
        v-if="field.type === 'string'"
        :id="`crud-form-field-string-${name}`"
        class="crud-form-field__string-input"
        type="text"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
        @update:modelValue="$emit('updateValue')"
    />

    <v-textarea
        v-if="field.type === 'longString'"
        :id="`crud-form-field-long-string-${name}`"
        class="crud-form-field__long-string-input"
        :rows="field.rows || 5"
        type="text"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
        @input="onInput"
    />

    <v-text-field
        v-if="field.type === 'password'"
        :id="`crud-form-field-password-${name}`"
        class="crud-form-field__password-input"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :type="show ? 'text' : 'password'"
        :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="show = !show"
        @update:modelValue="$emit('updateValue')"
        @input="onInput"
    />


    <v-combobox
        v-if="field.type === 'enum' && !field.noFilter"
        :id="`crud-form-field-enum-combobox-${name}`"
        class="crud-form-field__enum-combobox"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :items="field.enum"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="v => {
          if(onInput && typeof onInput === 'function'){
              onInput(v)
          }
          $emit('updateValue')
        }"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
    </v-combobox>

    <v-select
        v-if="field.type === 'select'"
        :id="`crud-form-field-select-${name}`"
        class="crud-form-field__select"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :items="field.items"
        item-title="title"
        item-value="value"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="v => {
          if(onInput && typeof onInput === 'function'){
              onInput(v)
          }
          $emit('updateValue')
        }"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
      <template v-slot:item="{ props: itemProps, item }">
        <v-list-item
            v-bind="itemProps"
            :id="`crud-form-field-select-item-${name}-${item.raw.value}`"
            class="crud-form-field__select-item"
            density="compact"
            :title="item.raw.title"
            :color="item.raw.color"
            :base-color="item.raw.color"
            :prepend-icon="item.raw.icon"
        />
      </template>

      <template v-slot:selection="{item}">
        <v-chip tile density="compact" :id="`crud-form-field-select-selection-${name}-${item.raw.value}`" class="crud-form-field__select-selection-chip" :color="item.raw.color" :prepend-icon="item.raw.icon">{{
            item.raw.title
          }}
        </v-chip>
      </template>
    </v-select>


    <v-select
        v-if="field.type === 'enum' && field.noFilter"
        :id="`crud-form-field-enum-select-${name}`"
        class="crud-form-field__enum-select"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :items="field.enum"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
    </v-select>


    <v-text-field
        v-if="field.type === 'number'"
        :id="`crud-form-field-number-${name}`"
        class="crud-form-field__number-input"
        type="number"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    />

    <media-field
        v-if="field.type === 'file'"
        :id="`crud-form-field-file-${name}`"
        class="crud-form-field__file-input"
        :name="name"
        :label="label"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        :preview="preview"
        :previewHeight="previewHeight"
    />

    <media-full-field
        v-if="field.type === 'fullFile'"
        :id="`crud-form-field-full-file-${name}`"
        class="crud-form-field__full-file-input"
        :name="name"
        :label="label"
        v-model.number="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        :preview="preview"
        :previewHeight="previewHeight"
    />

    <v-switch
        v-if="field.type === 'boolean'"
        :id="`crud-form-field-boolean-${name}`"
        class="crud-form-field__boolean-switch"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        color="primary"
        @input="onInput"
    />


    <v-date-input
        v-if="field.type === 'date'"
        :id="`crud-form-field-date-${name}`"
        class="crud-form-field__date-input"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint" :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @update:modelValue="(v) => {
          if(field.endOfDay){
            const date = new Date(v)
            date.setHours(23, 59, 59, 0)
            valueModel = date
          }
          if(onInput && typeof onInput === 'function'){
            onInput(v)
          }
          $emit('updateValue')
        }"
        @click:clear="() => {valueModel = null;  $emit('updateValue');} "
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        :max="field.max"
        @input="onInput"
    >
      <template v-if="field.endOfDay && field.showEndOfDayChip !== false" v-slot:append-inner>
        <v-chip :id="`crud-form-field-date-end-of-day-${name}`" class="crud-form-field__end-of-day-chip" size="small">23:59</v-chip>
      </template>
    </v-date-input>

    <crud-autocomplete
        v-if="field.type === 'ref'"
        :id="`crud-form-field-ref-${name}`"
        class="crud-form-field__ref-autocomplete"
        :entity="entity.getRef(field.ref)"
        :field="field"
        v-model="valueModel"
        @updateValue="$emit('updateValue')"
        :item-title="field?.refDisplay"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        :no-filter="field.noFilter"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :readonly="readonly"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        :add-on-the-fly="field?.addOnTheFly"
        :on-input="onInput"
    />

    <v-card v-if="field.type === 'object'" :id="`crud-form-field-object-${name}`" class="crud-form-field__object-card mt-3" variant="flat" border>

      <v-card-title :id="`crud-form-field-object-title-${name}`" class="crud-form-field__object-title text-h5">{{ field.label }}</v-card-title>
      <v-card-text :id="`crud-form-field-object-content-${name}`" class="crud-form-field__object-content">

        <v-row :id="`crud-form-field-object-row-${name}`" class="crud-form-field__object-row" dense>
          <v-col :id="`crud-form-field-object-column-${name}-${oField.name}`" class="crud-form-field__object-column" cols="12" v-for="oField in field.objectFields">
            <crud-form-field
                :id="`crud-form-field-object-field-${name}-${oField.name}`"
                class="crud-form-field__object-field"

                :entity="entity"
                :field="oField"
                :parent-field="field.name"
                :readonly="readonly"
                v-model="valueModel[oField.name]"
                :density="density"
                :variant="variant"
                :clearable="clearable"
                :hide-details="hasHideDetails"
                :single-line="singleLine"
                @updateValue="$emit('updateValue')"
                :prepend-icon="prependIcon"
                :append-icon="appendIcon"
                :prepend-inner-icon="prependInnerIcon"
                :append-inner-icon="appendInnerIcon"
            ></crud-form-field>
          </v-col>

        </v-row>

      </v-card-text>

    </v-card>

    <v-combobox
        v-if="field.type === 'array.string'"
        :id="`crud-form-field-array-string-${name}`"
        class="crud-form-field__array-string-combobox"
        type="text"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :closable-chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="v => {
          if(onInput && typeof onInput === 'function'){
              onInput(v)
          }
          $emit('updateValue')
        }"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
    </v-combobox>

    <v-combobox
        v-if="field.type === 'array.enum'"
        :id="`crud-form-field-array-enum-${name}`"
        class="crud-form-field__array-enum-combobox"
        type="text"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
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
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="v => {
          if(onInput && typeof onInput === 'function'){
              onInput(v)
          }
          $emit('updateValue')
        }"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
    </v-combobox>


    <crud-autocomplete
        v-if="field.type === 'array.ref'"
        :id="`crud-form-field-array-ref-${name}`"
        class="crud-form-field__array-ref-autocomplete"
        :entity="entity.getRef(field.ref)"
        :field="field"
        :item-title="field?.refDisplay"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        :no-filter="field.noFilter"
        :rules="rules"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        :add-on-the-fly="field?.addOnTheFly"
        :on-input="onInput"
    />


    <v-combobox
        v-if="field.type === 'array.number'"
        :id="`crud-form-field-array-number-${name}`"
        class="crud-form-field__array-number-combobox"
        type="number"
        :name="name"
        :label="label"
        :hint="hint ?? field.hint"
        :persistent-hint="persistentHint ?? field.persistentHint"
        :placeholder="placeholder ?? field.placeholder"
        :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="v => {
          if(onInput && typeof onInput === 'function'){
              onInput(v)
          }
          $emit('updateValue')
        }"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @input="onInput"
    >
    </v-combobox>


    <crud-form-list
        v-if="field.type === 'array.object'"
        :id="`crud-form-field-array-object-${name}`"
        class="crud-form-field__array-object-list"
        :entity="entity"
        :field="field"
        v-model="valueModel"
        :readonly="readonly"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
    />

    <crud-form-record
        v-if="field.type === 'record'"
        :id="`crud-form-field-record-${name}`"
        class="crud-form-field__record"
        :entity="entity"
        :field="field"
        v-model="valueModel"
        :readonly="readonly"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hasHideDetails"
        :single-line="singleLine"
        :error-messages="inputErrors"
        @updateValue="$emit('updateValue')"
    />

  </div>
</template>

<style scoped>

</style>
