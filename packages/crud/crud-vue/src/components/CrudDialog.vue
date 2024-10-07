<script setup lang="ts">
import type {TOperation} from "../interfaces/TOperation";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
const dialog = defineModel({type: Boolean, default: false})
import {useI18n} from "vue-i18n";
const {t,te} = useI18n()

defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  operation: {type: String as PropType<TOperation>}
})

defineEmits(
    ['submit', 'close']
)

</script>

<template>
  <v-dialog v-model="dialog" :fullscreen="entity.dialogFullscreen">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{entity.name}} {{te('action.'+operation) ? t('action.'+operation) : operation}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <slot></slot>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>

<style scoped>

</style>
