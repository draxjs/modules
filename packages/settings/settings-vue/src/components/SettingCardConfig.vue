<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
import SettingField from "./SettingField.vue";
import SettingEditor from "./SettingEditor.vue";
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import type {ISetting} from "@drax/settings-share";

const {fetchSettings, settingsGrouped} = useSetting()
const {t, te} = useI18n()

onMounted(async () => {
  await fetchSettings()
})

const settingEditing = ref()
const editing = ref(false)

function edit(setting: ISetting) {
  settingEditing.value = {...setting}
  editing.value = true
}

function clearEdit() {
  editing.value = false
  settingEditing.value = null
}

</script>

<template>
  <div>
    <h1 class="mb-6 text-h2">Settings</h1>

    <setting-editor
        v-if="editing"
        v-model="editing"
        :setting="settingEditing"
        @updateValue="clearEdit"
    ></setting-editor>

    <v-row>
      <v-col cols="12" v-for="(category,k) in settingsGrouped" class="mt-4">
        <v-card >
          <v-card-title>
            <h4 class="text-h4 mt-2">{{ k }}</h4>
          </v-card-title>
          <v-card-text>
            <v-card border flat rounded="xl"  v-for="(setting, i) in category" :key="i" class="mt-3" >
              <v-card-title class="d-flex">
                <h5 class="text-h5 mt-2">{{ setting.label }}</h5>
                <v-spacer></v-spacer>
                <v-chip v-if="setting.permission" density="compact" color="red" class="mt-2">
                  {{t('common.permission')}}:
                  {{ te('permission.'+setting.permission) ? t('permission.'+setting.permission) : setting.permission }}
                </v-chip>
                <v-chip v-else-if="setting.public" color="green" density="compact" class="mt-2">Public</v-chip>
                <v-chip v-else color="orange" density="compact" class="mt-2">Private</v-chip>
              </v-card-title>
              <v-card-text class="px-12 pt-3">
                    <setting-field
                        v-model="setting.value"
                        :setting="setting"

                    ></setting-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="mr-1 mt-1"
                    color="blue"
                    variant="text"
                    @click="edit(setting)"
                >{{t('action.edit')}}</v-btn>
              </v-card-actions>

            </v-card>


          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<style scoped>

</style>
