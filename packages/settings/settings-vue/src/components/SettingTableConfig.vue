<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
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
const visibleSecrets = ref<Record<string, boolean>>({})

function edit(setting: ISetting) {
  settingEditing.value = {...setting}
  editing.value = true
}

function clearEdit() {
  editing.value = false
  settingEditing.value = null
}

function toggleSecretVisibility(key: string) {
  visibleSecrets.value[key] = !visibleSecrets.value[key]
}

function isSecretVisible(key: string): boolean {
  return visibleSecrets.value[key] || false
}

function getObfuscatedValue(value: string): string {
  return '•'.repeat(Math.min(value?.length || 8, 12))
}

</script>

<template>
  <div>
    <h1 class="mb-6 text-h2">{{t('setting.menu')}}</h1>

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
                { title: t('setting.field.key'), key: 'key', width: '130px', minWidth: '130px' },
                { title: t('setting.field.label'), key: 'label', width: '130px', minWidth: '130px' },
                { title: t('setting.field.value'), key: 'value' },
                { title: t('setting.field.type'), key: 'type', width: '120px', minWidth: '120px' },
                { title: t('setting.field.scope'), key:'scope', width: '170px', minWidth: '170px' },
                { title: t('action.edit'), key: 'actions', width: '70px' },

            ]"
                :items="category"

            >

              <template v-slot:item.value="{ item }">
                <v-card variant="tonal" density="compact" class="my-1"><v-card-text>
                {{ item.prefix }}
                <template v-if="item.type === 'boolean'">
                  <v-chip :color="item.value ? 'green' : 'red' " tile>
                    {{ item.value }}
                  </v-chip>
                </template>
                <template v-else-if="['stringList','numberList','enumList'].includes(item.type)">
                  <v-chip v-for="(v,i) in item.value" :key="i">{{v}}</v-chip>
                </template>
                <template v-else-if="['password','secret'].includes(item.type)">
                  <span class="d-inline-flex align-center">
                    <span class="mr-2">
                      {{ isSecretVisible(item.key) ? item.value : getObfuscatedValue(item.value) }}
                    </span>
                    <v-btn
                        :icon="isSecretVisible(item.key) ? 'mdi-eye-off' : 'mdi-eye'"
                        size="x-small"
                        variant="text"
                        @click="toggleSecretVisibility(item.key)"
                    ></v-btn>
                  </span>
                </template>
                <template v-else>
                  {{item.value}}
                </template>
                {{ item.suffix }}
                </v-card-text></v-card>
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
