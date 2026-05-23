<script setup lang="ts">
import {computed} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud, IEntityCrudOperation} from "@drax/crud-share";
const dialog = defineModel({type: Boolean, default: false})
import {useI18n} from "vue-i18n";
const {t,te} = useI18n()

const {operation,entity } = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  operation: {type: String as PropType<IEntityCrudOperation>},
  fullscreen: {type: Boolean, default: undefined},
  maxWidth: {type: String, default: undefined},
})

defineEmits(
    ['submit', 'close']
)

const title = computed(() => {



  if(te('operation.'+operation)){
    const entityNameLocale = t(entity.name.toLowerCase()+'.entity')
    return t('operation.'+operation,{entity: entityNameLocale })
  }else{
    return operation
  }
})

</script>

<template>
  <v-dialog id="crud-dialog" class="crud-dialog" v-model="dialog"
            :z-index="entity.dialogZindex"
            :fullscreen="fullscreen === undefined ?  entity.dialogFullscreen : fullscreen"
            :max-width="maxWidth === undefined ? entity.dialogMaxWidth : maxWidth"
  >
    <v-card id="crud-dialog-card" class="crud-dialog__card">
      <v-toolbar id="crud-dialog-toolbar" class="crud-dialog__toolbar">
        <v-toolbar-title id="crud-dialog-title" class="crud-dialog__title">{{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <slot name="toolbar-actions"></slot>
        <v-btn id="crud-dialog-close-button" class="crud-dialog__close-button" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text id="crud-dialog-content" class="crud-dialog__content">
        <slot></slot>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>

<style scoped>

</style>
