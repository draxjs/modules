<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
import {onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import type {ISetting} from "@drax/settings-share";
import {formatDateTime} from "@drax/common-front";
import SettingField from "./SettingField.vue";

const {fetchSettings, settingsGrouped, updateSettingValue} = useSetting()
const {t} = useI18n()

onMounted(async () => {
  await fetchSettings()
  onSearchUpdate('')
})



function getTypeColor(type: string): string {

  //'string' | 'longString' | 'number' | 'enum' | 'boolean' | 'password' |'stringList' | 'numberList' | 'enumList' |'ref' |'secret'
  switch (type) {
    case 'string': return 'blue';
    case 'longString': return 'blue';
    case 'number': return 'purple';
    case 'enum': return 'orange';
    case 'boolean': return 'green';
    case 'password': return 'red';
    case 'stringList': return 'light-blue';
    case 'numberList': return 'purple';
    case 'enumList': return 'orange';
    case 'ref': return 'pink';
    case 'secret': return 'error';
    default: return 'grey';
  }
}





const settingsGroupedFiltered = ref<Record<string, ISetting[]>>({})

const search = ref<string>('')
function onSearchUpdate(value: string) {
  if(!value) settingsGroupedFiltered.value = {...settingsGrouped.value};

  for (const groupKey of Object.keys(settingsGroupedFiltered.value)) {
    settingsGroupedFiltered.value[groupKey] = settingsGroupedFiltered.value[groupKey].filter((setting: ISetting) =>
      setting.key.toLowerCase().includes(value.toLowerCase()) ||
      (setting.description && setting.description.toLowerCase().includes(value.toLowerCase()))
    )

    if(!settingsGroupedFiltered.value[groupKey]?.length) {
      delete settingsGroupedFiltered.value[groupKey];
    }
  }
}

const showModal = reactive<{
  isOpen: boolean, value?: string,
  setting?: ISetting
}>({ isOpen: false, value: '', setting: undefined})

const openShowModal = (key: string, value: string | undefined, setting: ISetting) => {
  showModal.isOpen = true;
  showModal.value = value;
  showModal.setting = setting
}

const closeShowModal = () => {
  showModal.isOpen = false;
  showModal.value = '';
}

const getSettingDescription = (key: string, description?: string) => {
  return {
    _id: "123",
    category: "Description",
    key: key,
    label: `${t('setting.descriptionof')} ${key}`,
    type: "longString",
    value: description
  } as ISetting
}

const informationUpdatingModal = reactive<{
  isOpen: boolean, setting?: ISetting, readonly: boolean
}>({isOpen: false, readonly: false})

const openInformationUpdatingModal = (setting: ISetting, readonly: boolean) => {
  informationUpdatingModal.isOpen = true
  informationUpdatingModal.setting = setting
  informationUpdatingModal.readonly = readonly
}

const closeInformationUpdatingModal = () => {
  informationUpdatingModal.isOpen = false
}

const updateLoading = ref<boolean>(false)

const form = ref()

const alert = reactive<{
  value: boolean, type: 'error' | 'success' | 'warning',
  text: string
}>({value: false, type: 'success', text: ''})

const showSuccess = (text: string) => {
  alert.value = true
  alert.type = "success"
  alert.text = text
}

const updateSetting = async (setting?: ISetting) => {
  try {
    if(!setting){
      console.error('[updateSetting] - setting not provided')
      return
    }
    updateLoading.value = true
    const validation = await form.value.validate()
    if(validation && validation.valid === true){
      const settingUpdated = await updateSettingValue(setting._id, setting.value)
      setting.updatedBy = settingUpdated.updatedBy
    }
    closeInformationUpdatingModal()
    showSuccess(t('setting.updated.successfuly'))
  } catch (e) {
    console.error(e)
  } finally {
    updateLoading.value = false
  }
}

</script>

<template>
  <div class="d-flex align-center px-16">
    <v-avatar style="border-radius: 7px;" color="menuIcon" class="mr-4">
      <v-icon>mdi-cog</v-icon>
    </v-avatar>
    <v-toolbar-title>{{ t('setting.page.title') }}</v-toolbar-title>
  </div>
  <v-divider class="my-4"></v-divider>
  <div class="d-flex justify-space-between px-16">
    <v-text-field
      :placeholder="t('setting.search')"
      persistent-placeholder
      clearable variant="outlined"
      prepend-inner-icon="mdi-magnify"
      v-model="search"
      @update:model-value="onSearchUpdate"
    ></v-text-field>
  </div>
  <div
    class="px-16"
  >
    <div class="pa-0 ma-0" style="width: calc(100%); height: calc(100vh - 315px); overflow-y: auto; scrollbar-width: thin;">
      <v-expansion-panels
        class="pr-1 mb-4" variant="accordion" v-for="groupkey of Object.keys(settingsGroupedFiltered)" :key="groupkey"
        :model-value="1"
      >
        <v-expansion-panel :value="1">
          <template #title>
            {{ groupkey }}
            <v-avatar class="ml-4" color="blue-grey-darken-2" style="border-radius: 4px;" size="24">
              {{ settingsGroupedFiltered[groupkey]?.length }}
            </v-avatar>
          </template>
          <template #text>
            <table style="width: 100%;">
              <thead>
                <v-row>
                  <v-col cols="2" class="text-caption">{{t('setting.field.key')}}</v-col>
                  <v-col cols="1" class="text-caption">{{t('setting.field.value')}}</v-col>
                  <v-col cols="1" class="text-caption">{{t('setting.field.type')}}</v-col>
                  <v-col cols="3" class="text-caption">{{t('setting.field.description')}}</v-col>
                  <v-col cols="1" class="text-caption">{{t('setting.field.visibility')}}</v-col>
                  <v-col cols="1" class="text-caption">{{t('setting.field.permission')}}</v-col>
                  <v-col cols="2" class="text-caption">{{t('setting.field.updated')}}</v-col>
                  <v-col cols="1"></v-col>
                </v-row>
              </thead>
              <tbody>
                <template :key="setting.key" v-for="setting in settingsGroupedFiltered[groupkey]">
                  <v-row class="mt-2">
                    <v-col cols="2" class="pr-4">
                      <span
                        style="display: inline-block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                      >
                        {{ setting.key }}
                      </span>
                    </v-col>
                    <v-col cols="1" class="pr-4 d-flex ga-2">
                      <template v-if="setting.value">
                        <v-icon size="small" color="grey" style="cursor: pointer;" @click="openShowModal(setting.key, setting.value, setting)">mdi-eye</v-icon>
                        <span
                          class="text-caption text-grey"
                          style="display: inline-block; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                        >
                          {{ setting.value }}
                        </span>
                      </template>
                      <span v-else class="text-caption text-grey">-</span>
                    </v-col>
                    <v-col cols="1" class="pr-4">
                      <v-chip :color="getTypeColor(setting.type)" density="compact" style="border-radius: 7px">
                        {{ setting.type }}
                      </v-chip>
                    </v-col>
                    <v-col cols="3" class="pr-4 d-flex ga-2">
                      <v-icon size="small" color="grey" style="cursor: pointer;" @click="openShowModal(setting.key, setting.description, getSettingDescription(setting.key, setting.description))">mdi-eye</v-icon>
                      <span
                          class="text-caption text-grey"
                          style="display: inline-block; max-width: 700px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                        >
                          {{ setting.description }}
                        </span>
                    </v-col>
                    <v-col cols="1" class="pr-4">
                      <v-chip
                        :color="setting.public ? 'green' : 'red'"
                        density="compact" style="border-radius: 7px;"
                      >
                        <v-icon start>{{ setting.public ? 'mdi-web' : 'mdi-lock' }}</v-icon>
                        {{ setting.public ? 'Público' : 'Privado' }}
                      </v-chip>
                    </v-col>
                    <v-col cols="1" class="pr-4">
                      <span class="text-caption" style="display: inline-block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ setting.permission ? setting.permission : 'N/A' }}
                      </span>
                    </v-col>
                    <v-col cols="2" class="pr-4">
                      <span>
                        {{ setting?.updatedAt ? formatDateTime(setting?.updatedAt) : '' }}<br>
                        {{ setting.updatedBy }}
                      </span>
                    </v-col>
                    <v-col cols="1" class="d-flex justify-end">
                      <v-menu location="bottom right">
                        <template v-slot:activator="{ props }">
                          <v-btn icon size="small" variant="text" v-bind="props">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="openInformationUpdatingModal(setting, true)">
                            <v-icon start>mdi-eye</v-icon>
                            {{ t('action.view') }}
                          </v-list-item>
                          <v-list-item @click="openInformationUpdatingModal(setting, false)">
                            <v-icon start>mdi-pencil</v-icon>
                            {{ t('action.edit') }}
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                </template>
              </tbody>
            </table>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>

  <!-- SHOW MODAL -->

  <v-dialog v-model="showModal.isOpen" width="auto">
    <v-card width="800">
      <v-toolbar class="pl-4">
        <v-icon start>mdi-information</v-icon>
        <v-card-title>{{ showModal.setting?.category === 'Description' ? t('setting.field.description') : t('setting.field.value') }}</v-card-title>
        <v-spacer></v-spacer>
        <v-btn text @click="closeShowModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <!-- @vue-ignore -->
        <setting-field
          :model-value="showModal.value"
          :setting="showModal.setting"
          :editing="false"
        ></setting-field>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- INFORMATION / UPDATING MODAL -->

  <v-dialog v-model="informationUpdatingModal.isOpen" width="auto">
    <v-card width="1200">
      <v-toolbar class="px-4">
        <v-icon start>{{ informationUpdatingModal.readonly ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
        <v-card-title>
          {{ informationUpdatingModal.readonly ? t('action.view') : t('action.edit') }} {{t('setting.configurationValue.title')}}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-icon size="small" @click="closeInformationUpdatingModal">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text>
        {{ t('setting.configurationValue.subtitle') }}

        <v-form ref="form">
          <v-row class="mt-5">
            <v-col cols="12" md="8" class="ma-0 pa-0 px-3" v-if="informationUpdatingModal.setting?.category">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.category')"
                readonly :model-value="informationUpdatingModal.setting?.category"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="ma-0 pa-0 px-3">
              <v-checkbox
                :label="t('setting.field.publicinfo')" density="compact"
                readonly :model-value="informationUpdatingModal.setting?.public"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="8" class="ma-0 pa-0 px-3">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.key')"
                readonly :model-value="informationUpdatingModal.setting?.key"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="ma-0 pa-0 px-3">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.type')"
                readonly :model-value="informationUpdatingModal.setting?.type"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12" class="ma-0 pa-0 px-3" v-if="informationUpdatingModal.setting?.permission">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.permission')"
                readonly :model-value="informationUpdatingModal.setting?.permission"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="ma-0 pa-0 px-3" v-if="informationUpdatingModal.setting?.prefix">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.prefix')"
                readonly :model-value="informationUpdatingModal.setting?.prefix"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="ma-0 pa-0 px-3" v-if="informationUpdatingModal.setting?.suffix">
              <v-text-field
                density="compact"
                variant="outlined"
                :label="t('setting.field.suffix')"
                readonly :model-value="informationUpdatingModal.setting?.suffix"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12" class="ma-0 pa-0 px-3">
              <!-- @vue-ignore -->
              <setting-field
                variant="outlined"
                v-model="informationUpdatingModal.setting.value"
                :setting="informationUpdatingModal.setting"
                :editing="!informationUpdatingModal.readonly"
              ></setting-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeInformationUpdatingModal">{{ t('action.close') }}</v-btn>
        <v-btn
          v-if="!informationUpdatingModal.readonly"
          variant="elevated" color="primary"
          @click="updateSetting(informationUpdatingModal.setting)"
          :loading="updateLoading"
        >
          {{ t('action.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
