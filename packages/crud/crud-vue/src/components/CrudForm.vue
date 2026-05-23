<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {getItemId} from "../helpers/getItemId";
import CrudFormField from "./CrudFormField.vue";
import {computed, ref} from "vue";
import type {PropType} from "vue";
import {useCrudStore} from "../stores/UseCrudStore";
import {useCrud} from "../composables/UseCrud";
import {useAuth} from '@drax/identity-vue'
import type {ValidationRule} from "vuetify";

const {hasPermission} = useAuth()
const {t, te} = useI18n()


const {entity, showSubmitAndReturn} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  showSubmitAndReturn: {type: Boolean, default: false},
})

const {onSubmit, onCancel, operation, error, form} = useCrud(entity)

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled', 'saved-and-return'])

const store = useCrudStore(entity?.name)

const formRef = ref()

const tabSelected = ref()
const menuSelected = ref<string>()

const fields = computed(() => {
  if (operation.value === 'create') {
    return entity.createFields
  } else if (operation.value === 'edit') {
    return entity.updateFields
  } else if (operation.value === 'delete') {
    return entity.deleteFields
  } else if (operation.value === 'view') {
    return entity.viewFields
  }
  return []
})


const aFields = computed(() => {
  return fields.value.filter((field: IEntityCrudField) => !field.permission || hasPermission(field.permission))
})

const generalFields = computed(() => {
  return aFields.value.filter((field: IEntityCrudField) => !field.groupTab && !field.groupMenu)
})

const tabFields = computed(() => {
  return (tab: string): IEntityCrudField[] => aFields.value.filter((field: IEntityCrudField) => field.groupTab === tab)
})

const menuFields = computed(() => {
  return (menu: string | null): IEntityCrudField[] => aFields.value.filter((field: IEntityCrudField) => field.groupMenu === menu)
})

const menuMaxHeight = computed(() => {
  return entity.menuMaxHeight || '300px'
})

function getFieldModelValue(fieldName: string) {
  return form.value[fieldName]
}

function setFieldModelValue(fieldName: string, value: any) {
  form.value[fieldName] = value
}

async function submitForm(returnAfterSubmit = false) {
  store.resetErrors()

  if (['create', 'edit'].includes(operation.value)) {
    const {valid, errors} = await formRef.value.validate()
    if (!valid) {
      console.log('Invalid form', errors)
      return
    }
  }

  let result = await onSubmit(form.value)

  switch (result.status) {
    case "created":
      emit("created", result.item)
      if (returnAfterSubmit) {
        emit("saved-and-return", result.item)
      }
      break
    case "updated":
      emit("updated", result.item)
      if (returnAfterSubmit) {
        emit("saved-and-return", result.item)
      }
      break
    case "deleted":
      emit("deleted")
      break
    case "viewed":
      emit("viewed")
      break
  }

}

async function submit() {
  await submitForm()
}

async function submitAndReturn() {
  await submitForm(true)
}

function cancel() {
  onCancel()
  emit('canceled')
}


const variant = computed(() => {
  if (operation.value === 'create') {
    return entity.inputVariantCreate
  } else if (operation.value === 'edit') {
    return entity.inputVariantEdit
  } else if (operation.value === 'delete') {
    return entity.inputVariantDelete
  } else if (operation.value === 'view') {
    return entity.inputVariantView
  }
  return 'outlined'
})

const tabInputErrors = computed(() => {
      return (tab:string) => {
        return tabFields.value(tab).some((field: IEntityCrudField) => store.getFieldInputErrors(field.name).length > 0)
      }
    }
)

const menuInputErrors = computed(() => {
      return (tab:string) => {
        return menuFields.value(tab).some((field: IEntityCrudField) => store.getFieldInputErrors(field.name).length > 0)
      }
    }
)

const rules = computed(() => {
  return (fieldName: string) => {
    return entity.getRule(fieldName) as ValidationRule[] || undefined
  }
})

const onInput = computed(() => {
  return (fieldName: string) => {
    return entity?.getOnInput(fieldName) as Function || undefined
  }
})

const onlyView = computed(()=> {
  return ['delete','view'].includes(operation?.value)
})

</script>

<template>
  <v-form id="crud-form" class="crud-form" ref="formRef" @submit.prevent>
    <v-card id="crud-form-card" class="crud-form__card" flat>

      <v-card-subtitle v-if="getItemId(form)" id="crud-form-id" class="crud-form__id">ID: {{ getItemId(form) }}</v-card-subtitle>

      <v-card-text v-if="error" id="crud-form-error-content" class="crud-form__error-content">
        <v-alert id="crud-form-error-alert" class="crud-form__error-alert" color="error">{{ te(error) ? t(error) : error }}</v-alert>
      </v-card-text>

      <v-card-text id="crud-form-content" class="crud-form__content">

        <!--GENERAL-->
        <v-row id="crud-form-general-fields" class="crud-form__general-fields">
          <v-col
              v-for="field in generalFields"
              :key="field.name"
              :id="`crud-form-general-field-column-${field.name}`"
              class="crud-form__general-field-column"
              :cols="field.cols ? field.cols : 12"
              :sm="field.sm ? field.sm : undefined"
              :md="field.md ? field.md : undefined"
              :lg="field.lg ? field.lg : undefined"
              :xl="field.xl ? field.xl : undefined"
          >
            <slot
                :name="`field.${field.name}`"
                v-bind="{
                  field,
                  form,
                  modelValue: getFieldModelValue(field.name),
                  setValue: (value: any) => setFieldModelValue(field.name, value)
                }"
            >

              <crud-form-field
                  :id="`crud-form-general-field-${field.name}`"
                  class="crud-form__general-field"
                  :field="field"
                  :entity="entity"
                  v-model="form[field.name]"
                  :clearable="false"
                  :readonly="onlyView || field.readonly"
                  :variant="variant"
                  :prepend-inner-icon="field?.prependInnerIcon"
                  :prepend-icon="field?.prependIcon"
                  :append-icon="field?.appendIcon"
                  :append-inner-icon="field?.appendInnerIcon"
                  :preview="field?.preview"
                  :previewHeight="field?.previewHeight"
                  :rules="rules(field.name)"
                  :on-input="onInput(field.name)"
                  :hint="field.hint"
                  :persistent-hint="field.persistentHint"
                  :placeholder="field.placeholder"
                  :persistent-placeholder="field.persistentPlaceholder"
              />
            </slot>

          </v-col>
        </v-row>

        <!--TAB-->
        <v-card id="crud-form-tabs-card" class="crud-form__tabs-card mt-4" variant="outlined" v-if="entity.tabs && entity.tabs.length > 0">

            <v-tabs id="crud-form-tabs" class="crud-form__tabs" v-model="tabSelected">
              <v-tab v-for="tab in entity.tabs" :id="`crud-form-tab-${tab}`" class="crud-form__tab" :value="tab" :key="tab">
                <span :id="`crud-form-tab-label-${tab}`" :class="['crud-form__tab-label', tabInputErrors(tab) ? 'text-red' : '']">
                {{ te(tab) ? t(tab) : tab }}
                </span>
              </v-tab>
            </v-tabs>
          <v-card-text id="crud-form-tabs-content" class="crud-form__tabs-content">
            <v-tabs-window id="crud-form-tabs-window" class="crud-form__tabs-window" v-model="tabSelected">
              <v-tabs-window-item v-for="tab in entity.tabs" :id="`crud-form-tab-panel-${tab}`" class="crud-form__tab-panel" :value="tab">
                <v-row class="crud-form__tab-fields pt-3">
                  <v-col
                      v-for="field in tabFields(tab)"
                      :key="field.name"
                      :id="`crud-form-tab-field-column-${tab}-${field.name}`"
                      class="crud-form__tab-field-column"
                      :cols="field.cols ? field.cols : 12"
                      :sm="field.sm ? field.sm : undefined"
                      :md="field.md ? field.md : undefined"
                      :lg="field.lg ? field.lg : undefined"
                      :xl="field.xl ? field.xl : undefined"
                  >
                    <slot
                        :name="`field.${field.name}`"
                        v-bind="{
                          field,
                          form,
                          modelValue: getFieldModelValue(field.name),
                          setValue: (value: any) => setFieldModelValue(field.name, value)
                        }"
                    >



                      <crud-form-field
                          :id="`crud-form-tab-field-${tab}-${field.name}`"
                          class="crud-form__tab-field"
                          :field="field"
                          :entity="entity"
                          v-model="form[field.name]"
                          :clearable="false"
                          :readonly="onlyView || field.readonly"
                          :variant="variant"
                          :prepend-inner-icon="field?.prependInnerIcon"
                          :prepend-icon="field?.prependIcon"
                          :append-icon="field?.appendIcon"
                          :append-inner-icon="field?.appendInnerIcon"
                          :rules="rules(field.name)"
                          :on-input="onInput(field.name)"
                          :hint="field.hint"
                          :persistent-hint="field.persistentHint"
                          :placeholder="field.placeholder"
                          :persistent-placeholder="field.persistentPlaceholder"
                      />
                    </slot>

                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!--MENU-->
        <v-row v-if="entity.menus && entity.menus.length > 0" id="crud-form-menu-layout" class="crud-form__menu-layout">
          <v-col id="crud-form-menu-nav-column" class="crud-form__menu-nav-column" cols="12" sm="4" md="3">
            <v-card id="crud-form-menu-nav-card" class="crud-form__menu-nav-card" variant="outlined">
              <v-card-text id="crud-form-menu-nav-content" class="crud-form__menu-nav-content" :style="{ maxHeight: menuMaxHeight, overflowY: 'auto' }">
                <v-list id="crud-form-menu-list" class="crud-form__menu-list" v-model="menuSelected">
                  <v-list-item v-for="menu in entity.menus" :id="`crud-form-menu-item-${menu}`" class="crud-form__menu-item" rounded="shaped" :value="menu" @click="menuSelected = menu">
                    <v-list-item-title class="crud-form__menu-item-title">
                    <span :id="`crud-form-menu-label-${menu}`" :class="['crud-form__menu-label', menuInputErrors(menu) ? 'text-red' : '']">
                        {{ te(menu) ? t(menu) : menu }}
                      </span>

                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col id="crud-form-menu-fields-column" class="crud-form__menu-fields-column" cols="12" sm="8" md="9">
            <v-card v-if="menuSelected" id="crud-form-menu-fields-card" class="crud-form__menu-fields-card" variant="outlined">
              <v-card-text id="crud-form-menu-fields-content" class="crud-form__menu-fields-content">
                <v-row id="crud-form-menu-fields" class="crud-form__menu-fields">
                  <v-col
                      v-for="field in menuFields(menuSelected)"
                      :key="field.name"
                      :id="`crud-form-menu-field-column-${menuSelected}-${field.name}`"
                      class="crud-form__menu-field-column"
                      :cols="field.cols ? field.cols : 12"
                      :sm="field.sm ? field.sm : undefined"
                      :md="field.md ? field.md : undefined"
                      :lg="field.lg ? field.lg : undefined"
                      :xl="field.xl ? field.xl : undefined"
                  >
                    <slot
                        :name="`field.${field.name}`"
                        v-bind="{
                          field,
                          form,
                          modelValue: getFieldModelValue(field.name),
                          setValue: (value: any) => setFieldModelValue(field.name, value)
                        }"
                    >
                      <crud-form-field
                          :id="`crud-form-menu-field-${menuSelected}-${field.name}`"
                          class="crud-form__menu-field"
                          :field="field"
                          :entity="entity"
                          v-model="form[field.name]"
                          :clearable="false"
                          :readonly="['delete','view'].includes(operation) || field.readonly"
                          :variant="variant"
                          :prepend-inner-icon="field?.prependInnerIcon"
                          :prepend-icon="field?.prependIcon"
                          :append-icon="field?.appendIcon"
                          :append-inner-icon="field?.appendInnerIcon"
                          :rules="rules(field.name)"
                          :on-input="onInput(field.name)"
                          :hint="field.hint"
                          :persistent-hint="field.persistentHint"
                          :placeholder="field.placeholder"
                          :persistent-placeholder="field.persistentPlaceholder"
                      />
                    </slot>

                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-card-text>

      <v-card-actions id="crud-form-actions" class="crud-form__actions">
        <v-spacer></v-spacer>
        <v-btn id="crud-form-cancel-button" variant="text" :class="['crud-form__cancel-button', entity.cancelBtnFormClass]" @click="cancel">
          {{ operation == 'view' ? t('action.close') : t('action.cancel') }}
        </v-btn>
        <v-btn id="crud-form-submit-button" variant="flat" v-if="operation != 'view'" :class="['crud-form__submit-button', entity.submitBtnFormClass]" @click="submit" :loading="store.loading">
          {{ operation ? t('action.'+operation) : t('action.sent') }}
        </v-btn>
        <v-btn
            id="crud-form-submit-and-return-button"
            variant="flat"
            v-if="showSubmitAndReturn && ['create', 'edit'].includes(operation || '')"
            :class="['crud-form__submit-and-return-button', entity.submitBtnFormClass]"
            @click="submitAndReturn"
            :loading="store.loading"
        >
          {{ te('action.saveAndReturn') ? t('action.saveAndReturn') : 'Guardar y volver' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>

</style>
