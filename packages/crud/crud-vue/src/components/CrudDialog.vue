<script setup lang="ts">
import type {TOperation} from "../interfaces/TOperation";
import type {PropType} from "vue";
import EntityCrud from "../EntityCrud";
const dialog = defineModel({type: Boolean, default: false})

defineProps({
  entity: {type: Object as PropType<EntityCrud>, required: true},
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
        <v-toolbar-title>{{entity.name}} {{$te('action.'+operation) ? $t('action.'+operation) : operation}}</v-toolbar-title>
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
