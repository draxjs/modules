<script setup lang="ts">
import {useCopy} from "@drax/common-vue";
import {useI18n} from "vue-i18n";
import {defineModel, type PropType} from "vue";
import type {IUserApiKey} from "@drax/identity-share";

const {t} = useI18n()

const {copy} = useCopy()

defineProps({
  userApiKey: {type: Object as PropType<IUserApiKey>, required: true},
})

const dialog = defineModel<boolean>({
  type: Boolean
})

</script>

<template>

  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-sheet border>
      <v-toolbar>
        <v-toolbar-title>{{t('userapikey.created')}}</v-toolbar-title>
      </v-toolbar>
      <v-card>

        <v-card-title class="my-3 text-center">{{userApiKey.name}}</v-card-title>

        <v-card-text>
        <v-text-field
            label="API KEY"
            v-model="userApiKey.secret"
            color="success"
            base-color="success"
            variant="outlined"
            @click:append="copy(userApiKey.secret)"
            :hint="t('userapikey.secretWarning')"
            persistent-hint readonly
        >
          <template v-slot:append>
            <v-btn icon class="text-success" @click="copy(userApiKey.secret)">
              <v-icon>mdi mdi-content-copy</v-icon>
            </v-btn>
          </template>

        </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">{{ t('action.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>

</template>

<style scoped>

</style>
