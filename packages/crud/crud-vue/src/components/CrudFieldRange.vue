<script setup lang="ts">
import {computed, type PropType} from "vue";
import type {ValidationRule} from "vuetify";
import {VDateInput} from "vuetify/labs/VDateInput";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {normalizeDateRangeValue} from "../helpers/CrudRangeFilters";

const {t} = useI18n()

const valueModel = defineModel<any>({type: [Object], default: null})

const {
  name,
  label,
  field,
  readonly,
  errorMessages,
  rules,
  density,
  variant,
  clearable,
  hideDetails,
  singleLine,
  hint,
  persistentHint,
  placeholder,
  persistentPlaceholder,
  prependIcon,
  appendIcon,
  prependInnerIcon,
  appendInnerIcon,
  onInput
} = defineProps({
  name: {type: String, required: true},
  label: {type: String, required: true},
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudFilter>, required: true},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  hint: {type: String, required: false},
  persistentHint: {type: Boolean, default: false},
  placeholder: {type: String, required: false},
  persistentPlaceholder: {type: Boolean, default: false},
  errorMessages: {type: Array as PropType<string[]>, default: null, required: false},
  onInput: {type: Function as PropType<Function>, required: false},
  rules: {type: Array as PropType<ValidationRule[]>, required: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
})

const emit = defineEmits(['updateValue'])

const rangeValueModel = computed({
  get() {
    return normalizeDateRangeValue(valueModel.value)
  },
  set(value) {
    valueModel.value = normalizeDateRangeValue(value)
  }
})

function normalizeDateValue(value: any, endOfDay = false) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? new Date(value) : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 0)
  }

  return date
}

function updateRangeValue(bound: 'from' | 'to', rawValue: any) {
  const nextValue = {
    ...normalizeDateRangeValue(rangeValueModel.value),
    [bound]: normalizeDateValue(rawValue, bound === 'to' && !!field.endOfDay)
  }

  const fromDate = normalizeDateValue(nextValue.from)
  const toDate = normalizeDateValue(nextValue.to)

  if (fromDate && toDate && fromDate > toDate) {
    if (bound === 'from') {
      nextValue.to = normalizeDateValue(nextValue.from, !!field.endOfDay)
    } else {
      nextValue.from = normalizeDateValue(nextValue.to)
    }
  }

  rangeValueModel.value = nextValue

  if(onInput && typeof onInput === 'function'){
    onInput(nextValue)
  }

  emit('updateValue')
}

const rangeFromModel = computed({
  get() {
    return rangeValueModel.value.from
  },
  set(value) {
    updateRangeValue('from', value)
  }
})

const rangeToModel = computed({
  get() {
    return rangeValueModel.value.to
  },
  set(value) {
    updateRangeValue('to', value)
  }
})

const rangeFromMax = computed(() => {
  return rangeValueModel.value.to ?? field.max
})

const rangeToMin = computed(() => {
  return rangeValueModel.value.from ?? undefined
})

const fromInnerIcon = computed(() => {
  return prependInnerIcon || 'mdi-calendar-start'
})

const toInnerIcon = computed(() => {
  return appendInnerIcon || 'mdi-calendar-end'
})
</script>

<template>
  <v-row dense>
    <v-col cols="12" sm="6">
      <v-date-input
          :name="`${name}_from`"
          :label="`${label} ${t('crud.from')}`"
          :hint="hint ?? field.hint"
          :persistent-hint="persistentHint ?? field.persistentHint"
          :placeholder="placeholder ?? field.placeholder"
          :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
          v-model="rangeFromModel"
          :readonly="readonly"
          :error-messages="errorMessages"
          :rules="rules"
          :density="density"
          :variant="variant"
          :clearable="clearable"
          :hide-details="hideDetails"
          :single-line="singleLine"
          @click:clear="() => updateRangeValue('from', null)"
          :prepend-icon="prependIcon"
          :append-icon="appendIcon"
          :prepend-inner-icon="fromInnerIcon"
          :append-inner-icon="appendInnerIcon"
          :max="rangeFromMax"
          @input="onInput"
      />
    </v-col>

    <v-col cols="12" sm="6">
      <v-date-input
          :name="`${name}_to`"
          :label="`${label} ${t('crud.to')}`"
          :hint="hint ?? field.hint"
          :persistent-hint="persistentHint ?? field.persistentHint"
          :placeholder="placeholder ?? field.placeholder"
          :persistent-placeholder="persistentPlaceholder ?? field.persistentPlaceholder"
          v-model="rangeToModel"
          :readonly="readonly"
          :error-messages="errorMessages"
          :rules="rules"
          :density="density"
          :variant="variant"
          :clearable="clearable"
          :hide-details="hideDetails"
          :single-line="singleLine"
          @click:clear="() => updateRangeValue('to', null)"
          :prepend-icon="prependIcon"
          :append-icon="appendIcon"
          :prepend-inner-icon="toInnerIcon"
          :append-inner-icon="appendInnerIcon"
          :min="rangeToMin"
          :max="field.max"
          @input="onInput"
      >
        <template v-if="field.endOfDay && field.showEndOfDayChip !== false" v-slot:append-inner>
          <v-chip size="small">23:59</v-chip>
        </template>
      </v-date-input>
    </v-col>
  </v-row>
</template>
