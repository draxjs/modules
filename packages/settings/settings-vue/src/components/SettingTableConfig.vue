<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
import SettingEditor from "./SettingEditor.vue";
import {onMounted, ref, computed} from "vue";
import {useI18n} from "vue-i18n";
import type {ISetting} from "@drax/settings-share";
import {CrudAutocomplete, useEntityStore} from "@drax/crud-vue";

const {fetchSettings, settingsGrouped} = useSetting()
const {t, te} = useI18n()

onMounted(async () => {
  await fetchSettings()
  onSearchUpdate('')
})

const settingEditing = ref()
const editing = ref(false)
const visibleSecrets = ref<Record<string, boolean>>({})

function edit(setting: ISetting) {
  settingEditing.value = {...setting}
  editing.value = true
}

function clearEdit(newValue: any) {
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

const search = ref<string>('')
function onSearchUpdate(value: string) {
  search.value = value
}

const settingsGroupedFiltered = computed(() => {
  if (!search.value) {
    return settingsGrouped.value
  }

  const filtered: Record<string, ISetting[]> = {}
  const searchLower = search.value.toLowerCase()

  for (const groupKey of Object.keys(settingsGrouped.value)) {
    const filteredSettings = settingsGrouped.value[groupKey].filter((setting: ISetting) =>
      setting.key.toLowerCase().includes(searchLower) ||
      (setting.description && setting.description.toLowerCase().includes(searchLower))
    )

    if (filteredSettings.length > 0) {
      filtered[groupKey] = filteredSettings
    }
  }

  return filtered
})

const entityStore = useEntityStore()

const getEntity = computed(() => {
  return (entity: string | undefined) => {
    return entity ? entityStore.getEntity(entity) : undefined
  }
})

</script>

<template>
  <div>
    <h3 class="mb-2 text-h3">{{t('setting.menu')}}</h3>
    <v-divider class="mb-3"></v-divider>

    <setting-editor
        v-if="editing"
        v-model="editing"
        :setting="settingEditing"
        @updateValue="clearEdit"
    ></setting-editor>

    <v-row>
      <v-col>
          <v-text-field
              :placeholder="t('setting.search')"
              persistent-placeholder
              clearable variant="outlined"
              prepend-inner-icon="mdi-magnify"
              v-model="search"
              @update:model-value="onSearchUpdate"
          ></v-text-field>
      </v-col>

      <v-col cols="12" v-for="(category,k) in settingsGroupedFiltered">
        <v-card>
          <v-card-title>
            <h4 class="text-h4 mt-2 ">{{ k }}</h4>
          </v-card-title>
          <v-card-text>

            <v-data-table
                hide-default-footer
                :headers="[
                { title: t('setting.field.variable'), key: 'label', width: '220px', minWidth: '220px', maxWidth: '220px' },
                { title: t('setting.field.value'), key: 'value' },
                { title: t('setting.field.config'), key: 'config', width: '220px', minWidth: '220px', maxWidth: '220px' },
                { title: t('action.edit'), key: 'actions', width: '70px' },

            ]"
                :items="category"

            >


              <template v-slot:item.label="{ item }">
                <span class="font-weight-bold">{{item.label }}</span><br>
                <span class="font-italic">{{ item.description }}</span>
              </template>

              <template v-slot:item.value="{ item }">
                <v-card :variant="['stringList','numberList','enumList','boolean','ref'].includes(item.type) ? 'flat' : 'tonal'" density="compact" class="my-1">
                  <v-card-text>
                  {{ item.prefix }}
                  <template v-if="item.type === 'boolean'">
                    <v-chip size="large" :color="item.value ? 'green' : 'red' " tile>
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
                    <template v-else-if="['ref'].includes(item.type)">
                      <!--ref-->
                      <crud-autocomplete
                          readonly
                          v-model="item.value"
                          :entity="getEntity(item.entity)"
                          :field="{name: item.key, type: 'ref', label: item.label, default:null}"
                          :clearable="false"
                      ></crud-autocomplete>
                    </template>
                  <template v-else>
                    {{item.value}}
                  </template>
                  {{ item.suffix }}
                </v-card-text>
                </v-card>
              </template>

              <template v-slot:item.config="{ item }">
                <div class="py-1">
                <span class="font-weight-bold">{{item.key }}</span><br>
                <span class="font-italic">{{ item.type }}</span>
                <div>
                  <v-chip tile v-if="item?.permission" density="compact" color="purple" prepend-icon="mdi-key">
                    {{
                      te('permission.' + item?.permission) ? t('permission.' + item?.permission) : item?.permission
                    }}
                  </v-chip>
                  <v-chip tile v-else-if="item?.public" color="blue" density="compact" prepend-icon="mdi-earth">Public</v-chip>
                  <v-chip tile v-else color="orange" density="compact" prepend-icon="mdi-lock">Private</v-chip>
                </div>
                </div>
              </template>


              <template v-slot:item.scope="{ item }">

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
