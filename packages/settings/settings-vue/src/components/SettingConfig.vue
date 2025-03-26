<script setup lang="ts">
import {useSetting} from "../composables/UseSetting";
import SettingField from "./SettingField.vue";
import SettingEditor from "./SettingEditor.vue";
import {onMounted, ref} from "vue";
import type {ISetting} from "@drax/settings-share";

const {fetchSettings, settingsGrouped} = useSetting()

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
    <h1 class="mb-6">Settings</h1>

    <setting-editor
        v-if="editing"
        v-model="editing"
        :setting="settingEditing"
        @updateValue="clearEdit"
    ></setting-editor>

    <v-row >
      <v-col cols="12" v-for="(category,k) in settingsGrouped">
        <v-card>
          <v-card-title>
            {{ k }}
          </v-card-title>
          <v-card-text>
            <v-row  v-for="(setting, i) in category" :key="i">
              <v-col cols="9">
                <setting-field

                    v-model="setting.value"
                    :setting="setting"
                ></setting-field>
              </v-col>
              <v-col cols="3">
                <v-btn
                    icon="mdi-pencil"
                    class="mr-1"
                    variant="text"
                    color="blue"
                    slim
                    @click="edit(setting)"
                ></v-btn>
              </v-col>
            </v-row>


          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<style scoped>

</style>
