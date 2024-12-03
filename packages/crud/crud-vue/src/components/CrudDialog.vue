<script setup lang="ts">
import {computed} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud, IEntityCrudOperation} from "@drax/crud-share";
const dialog = defineModel({type: Boolean, default: false})
import {useI18n} from "vue-i18n";
const {t,te} = useI18n()

const {operation,entity } = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  operation: {type: String as PropType<IEntityCrudOperation>}
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
  <v-dialog v-model="dialog" :fullscreen="entity.dialogFullscreen">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{title}}</v-toolbar-title>
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
