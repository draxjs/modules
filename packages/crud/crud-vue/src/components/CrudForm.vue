<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {useFormUtils} from "../composables/UseFormUtils";
import {getItemId} from "../helpers/getItemId";
import CrudFormField from "./CrudFormField.vue";
import {computed, defineEmits, defineProps, ref} from "vue";
import type {PropType} from "vue";
import {useCrudStore} from "../stores/UseCrudStore";
import {useCrud} from "../composables/UseCrud";
import {useAuth} from '@drax/identity-vue'

const {hasPermission} = useAuth()
const {t, te} = useI18n()


const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {onSubmit, onCancel, operation, error, form} = useCrud(entity)

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled'])

const store = useCrudStore()

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

async function submit() {
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
      break
    case "updated":
      emit("updated", result.item)
      break
    case "deleted":
      emit("deleted")
      break
    case "viewed":
      emit("viewed")
      break
  }

}

function cancel() {
  onCancel()
  emit('canceled')
}

const {
  variant, submitColor
} = useFormUtils(operation.value)

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


</script>

<template>
  <v-form ref="formRef" @submit.prevent>
    <v-card flat>

      <v-card-subtitle v-if="getItemId(form)">ID: {{ getItemId(form) }}</v-card-subtitle>

      <v-card-text v-if="error">
        <v-alert color="error">{{ te(error) ? t(error) : error }}</v-alert>
      </v-card-text>

      <v-card-text>

        <!--GENERAL-->
        <v-row>
          <v-col
              v-for="field in generalFields"
              :key="field.name"
              :cols="field.cols ? field.cols : 12"
              :sm="field.sm ? field.sm : undefined"
              :md="field.md ? field.md : undefined"
              :lg="field.lg ? field.lg : undefined"
              :xl="field.xl ? field.xl : undefined"
          >
            <slot :name="`field.${field.name}`" v-bind="{field}">
              <crud-form-field
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
              />
            </slot>

          </v-col>
        </v-row>

        <!--TAB-->
        <v-card class="mt-4" variant="outlined" v-if="entity.tabs && entity.tabs.length > 0">

            <v-tabs v-model="tabSelected">
              <v-tab v-for="tab in entity.tabs" :value="tab" :key="tab">
                <span  :class="tabInputErrors(tab) ? 'text-red' : ''">
                {{ te(tab) ? t(tab) : tab }}
                </span>
              </v-tab>
            </v-tabs>
          <v-card-text>
            <v-tabs-window v-model="tabSelected">
              <v-tabs-window-item v-for="tab in entity.tabs" :value="tab">
                <v-row>
                  <v-col
                      v-for="field in tabFields(tab)"
                      :key="field.name"
                      :cols="field.cols ? field.cols : 12"
                      :sm="field.sm ? field.sm : undefined"
                      :md="field.md ? field.md : undefined"
                      :lg="field.lg ? field.lg : undefined"
                      :xl="field.xl ? field.xl : undefined"
                  >
                    <slot :name="`field.${field.name}`" v-bind="{field}">
                      <crud-form-field
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
                      />
                    </slot>

                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!--MENU-->
        <v-row v-if="entity.menus && entity.menus.length > 0">
          <v-col cols="12" sm="4" md="3">
            <v-card variant="outlined">
              <v-card-text :style="{ maxHeight: menuMaxHeight, overflowY: 'auto' }">
                <v-list v-model="menuSelected">
                  <v-list-item v-for="menu in entity.menus" rounded="shaped" :value="menu" @click="menuSelected = menu">
                    <v-list-item-title>
                    <span :class="menuInputErrors(menu) ? 'text-red' : ''">
                        {{ te(menu) ? t(menu) : menu }}
                      </span>

                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="8" md="9">
            <v-card v-if="menuSelected" variant="outlined">
              <v-card-text>
                <v-row>
                  <v-col
                      v-for="field in menuFields(menuSelected)"
                      :key="field.name"
                      :cols="field.cols ? field.cols : 12"
                      :sm="field.sm ? field.sm : undefined"
                      :md="field.md ? field.md : undefined"
                      :lg="field.lg ? field.lg : undefined"
                      :xl="field.xl ? field.xl : undefined"
                  >
                    <slot :name="`field.${field.name}`" v-bind="{field}">
                      <crud-form-field
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
                      />
                    </slot>

                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" :class="entity.cancelBtnFormClass" @click="cancel">
          {{ operation == 'view' ? t('action.close') : t('action.cancel') }}
        </v-btn>
        <v-btn variant="flat" v-if="operation != 'view'" :class="entity.submitBtnFormClass" @click="submit" :loading="store.loading">
          {{ operation ? t('action.' + operation) : t('action.sent') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>

</style>
