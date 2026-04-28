<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {CrudFormField, useCrud} from '@drax/crud-vue'
import CovenantCrud from '../../cruds/CovenantCrud'
import CovenantProvider from '../../providers/CovenantProvider'
import type {ValidationRule} from 'vuetify'
import type {ICovenant, ICovenantBase} from '../../interfaces/ICovenant'

interface ICovenantMultiTarget {
  fullname: string
  dni: string
  month: string
  amount: string
  comment: string
  save: boolean
}

interface ICovenantMultiForm {
  date: Date | null
  group: any
  locality: string
  address: string
  since: string
  until: string
  targets: ICovenantMultiTarget[]
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', items: ICovenant[]): void
}>()

const entity = CovenantCrud.instance
const {cloneItem, doPaginate} = useCrud(entity)

const formRef = ref()
const loading = ref(false)
const error = ref('')
const commonInputErrors = ref<Record<string, string[]>>({})
const targetInputErrors = ref<Record<number, Record<string, string[]>>>({})
const form = ref<ICovenantMultiForm>(createForm())

const commonFieldNames = ['date', 'group', 'locality', 'address', 'since', 'until']
const targetFieldNames = ['fullname', 'dni', 'month', 'amount', 'comment']
const targetFieldMd: Record<string, number> = {
  fullname: 3,
  dni: 3,
  month: 1,
  amount: 2,
  comment: 3,
}

const commonFields = computed(() => entity.fields.filter(field => commonFieldNames.includes(field.name)))
const targetFields = computed(() => entity.fields.filter(field => targetFieldNames.includes(field.name)))
const hasSavedTargets = computed(() => form.value.targets.some(target => target.save))

watch(
  () => form.value.targets.length,
  () => {
    const nextErrors: Record<number, Record<string, string[]>> = {}
    form.value.targets.forEach((_, index) => {
      nextErrors[index] = targetInputErrors.value[index] ?? {}
    })
    targetInputErrors.value = nextErrors
  },
  {immediate: true}
)

function createTarget(): ICovenantMultiTarget {
  return {
    fullname: '',
    dni: '',
    month: '',
    amount: '',
    comment: '',
    save: false,
  }
}

function createForm(): ICovenantMultiForm {
  const base = cloneItem(entity.form) as Record<string, any>

  return {
    date: base.date ? new Date(base.date) : null,
    group: base.group ?? null,
    locality: base.locality ?? '',
    address: base.address ?? '',
    since: base.since ?? '',
    until: base.until ?? '',
    targets: [createTarget()],
  }
}

function resetState() {
  form.value = createForm()
  error.value = ''
  commonInputErrors.value = {}
  targetInputErrors.value = {}
}

function addTarget() {
  form.value.targets.push(createTarget())
}

function removeTarget(index: number) {
  if (form.value.targets.length === 1 || form.value.targets[index]?.save) {
    return
  }

  form.value.targets.splice(index, 1)
}

function normalizeHour(value: string) {
  return value.replace(/[^0-9:]/g, '')
}

function normalizeDni(value: string) {
  return value.replace(/[^0-9]/g, '')
}

function normalizeMonth(value: string) {
  return value.toUpperCase()
}

function normalizeAmount(value: string) {
  return value.replace(/[^0-9,.]/g, '').replace(',', '.')
}

function normalizeForm() {
  form.value.since = normalizeHour(form.value.since)
  form.value.until = normalizeHour(form.value.until)

  form.value.targets = form.value.targets.map(target => ({
    ...target,
    dni: normalizeDni(target.dni),
    month: normalizeMonth(target.month),
    amount: normalizeAmount(target.amount),
  }))
}

function getRules(fieldName: string) {
  return entity.getRule(fieldName) as ValidationRule[] | undefined
}

function getOnInput(fieldName: string, form: any) {
 switch (fieldName) {
   case 'month':
     form[fieldName] = normalizeMonth(form[fieldName])
     break
   case 'amount':
     form[fieldName] = normalizeAmount(form[fieldName])
     break
   case 'since':
   case 'until':
     form[fieldName] = normalizeHour(form[fieldName])
     break
 }
}

function getCommonFieldErrors(fieldName: string) {
  return commonInputErrors.value[fieldName] ?? []
}

function getTargetFieldErrors(index: number, fieldName: string) {
  return targetInputErrors.value[index]?.[fieldName] ?? []
}

function getTargetFieldMd(fieldName: string) {
  return targetFieldMd[fieldName] ?? 3
}

function setTargetErrors(index: number, errors: Record<string, string[]> = {}) {
  targetInputErrors.value = {
    ...targetInputErrors.value,
    [index]: errors,
  }
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = Math.random() * 16 | 0
    const value = char === 'x' ? rand : (rand & 0x3 | 0x8)
    return value.toString(16)
  })
}

async function submit() {
  commonInputErrors.value = {}
  targetInputErrors.value = {}
  error.value = ''

  normalizeForm()

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  const pendingTargets = form.value.targets
    .map((target, index) => ({target, index}))
    .filter(({target}) => !target.save)

  if (pendingTargets.length === 0) {
    handleClose()
    return
  }

  loading.value = true
  const createdItems: ICovenant[] = []
  const link = createUuid()

  const basePayload = {
    date: form.value.date,
    since: form.value.since,
    until: form.value.until,
    locality: form.value.locality,
    address: form.value.address,
    group: form.value.group,
    link,
  }

  try {
    for (const {target, index} of pendingTargets) {
      setTargetErrors(index)

      try {
        const payload = {
          ...basePayload,
          fullname: target.fullname,
          dni: target.dni,
          month: target.month,
          amount: Number.parseFloat(target.amount),
          comment: target.comment,
        } as ICovenantBase

        const created = await CovenantProvider.instance.create(payload)

        form.value.targets[index].save = true
        createdItems.push(created)
      } catch (e: any) {
        setTargetErrors(index, e?.inputErrors ?? {})
        error.value = e?.message ?? 'Ocurrio un error al crear las cobranzas'
      }
    }

    if (createdItems.length > 0) {
      await doPaginate()
      emit('created', createdItems)
    }

    if (createdItems.length === pendingTargets.length) {
      handleClose()
      return
    }

    if (createdItems.length > 0) {
      error.value = `Se crearon ${createdItems.length} registros. Revisa los destinatarios con error para reintentar.`
    }
  } finally {
    loading.value = false
  }
}

function handleClose() {
  resetState()
  emit('close')
}
</script>

<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-row>
      <v-col
        v-for="field in commonFields"
        :key="field.name"
        :cols="field.cols ?? 12"
        :sm="field.sm"
        :md="field.md"
        :lg="field.lg"
        :xl="field.xl"
      >
        <crud-form-field
          :field="field"
          :entity="entity"
          v-model="form[field.name as keyof ICovenantMultiForm]"
          :clearable="false"
          :readonly="loading"
          :variant="'outlined'"
          :rules="getRules(field.name)"
          :on-input="() => getOnInput(field.name, form)"
        />

        <v-messages
          v-if="getCommonFieldErrors(field.name).length > 0"
          :messages="getCommonFieldErrors(field.name)"
          color="error"
          active
        />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" :disabled="loading" @click="addTarget">
        Agregar destinatario
      </v-btn>
      <v-btn
        variant="text"
        prepend-icon="mdi-close"
        :disabled="loading"
        @click="handleClose"
      >
        Cancelar
      </v-btn>
    </div>

    <v-card
      v-for="(target, index) in form.targets"
      :key="index"
      variant="outlined"
      class="mb-4"
    >
      <v-card-item>
        <template #title>
          <div class="d-flex align-center justify-space-between ga-3">
            <span>Destinatario {{ index + 1 }}</span>
            <div class="d-flex align-center ga-2">
              <v-chip v-if="target.save" color="success" size="small" variant="tonal">
                Creado
              </v-chip>
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                :disabled="loading || form.targets.length === 1 || target.save"
                @click="removeTarget(index)"
              />
            </div>
          </div>
        </template>
      </v-card-item>

      <v-card-text>
        <v-row dense>
          <v-col
            v-for="field in targetFields"
            :key="`${index}-${field.name}`"
            :cols="field.cols ?? 12"
            :sm="field.sm"
            :md="getTargetFieldMd(field.name)"
          >
            <crud-form-field
              :field="field"
              :entity="entity"
              v-model="target[field.name as keyof ICovenantMultiTarget]"
              :clearable="false"
              :readonly="loading || target.save"
              :variant="'outlined'"
              :rules="getRules(field.name)"
              :on-input="() => getOnInput(field.name, target)"
            />

            <v-messages
              v-if="getTargetFieldErrors(index, field.name).length > 0"
              :messages="getTargetFieldErrors(index, field.name)"
              color="error"
              active
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" :disabled="loading" @click="handleClose">
        Cancelar
      </v-btn>
      <v-btn color="primary" :loading="loading" @click="submit">
        {{ hasSavedTargets ? 'Guardar pendientes' : 'Guardar cobranzas' }}
      </v-btn>
    </div>
  </v-form>
</template>
