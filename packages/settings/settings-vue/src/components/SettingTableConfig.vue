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
        <v-card>
          <v-card-title>
            <h4 class="text-h4 mt-2">{{ k }}</h4>
          </v-card-title>
          <v-card-text>

            <v-data-table
                hide-default-footer
                :headers="[
                { title: t('common.identifier'), key: 'key', width: '130px', minWidth: '130px' },
                { title: t('common.value'), key: 'value' },
                { title: t('common.type'), key: 'type', width: '120px', minWidth: '120px' },
                { title: t('common.scope'), key:'scope', width: '170px', minWidth: '170px' },
                { title: t('common.actions'), key: 'actions', width: '70px' },

            ]"
                :items="category"

            >

              <template v-slot:item.value="{ item }">
                {{ item.prefix }}
                <template v-if="item.type === 'boolean'">
                  <v-chip :color="item.value === true ? 'green' : 'red' " tile>
                    {{ item.value }}
                  </v-chip>
                </template>
                <template v-else-if="['stringList','numberList','enumList'].includes(item.type)">
                  <v-chip v-for="(v,i) in item.value" :key="i">{{v}}</v-chip>
                </template>
                <template v-else>
                  {{item.value}}
                </template>
                {{ item.suffix }}
              </template>

              <template v-slot:item.scope="{ item }">
                <div style="width: 200px;">
                  <v-chip v-if="item?.permission" density="compact" color="purple">
                    {{
                      te('permission.' + item?.permission) ? t('permission.' + item?.permission) : item?.permission
                    }}
                  </v-chip>
                  <v-chip v-else-if="item?.public" color="blue" density="compact">Public</v-chip>
                  <v-chip v-else color="orange" density="compact">Private</v-chip>
                </div>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                    class="mr-1 mt-1"
                    color="blue"
                    variant="text"
                    icon="mdi-pencil"
                    @click="edit(item)"
                ></v-btn>
              </template>
            </v-data-table>

          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<style scoped>

</style>
