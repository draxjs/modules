
<script setup lang="ts">
import {ref} from 'vue'
import CovenantCrud from '../../cruds/CovenantCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import CovenantCreateMultiForm from '../forms/CovenantCreateMultiForm.vue'

const multiCreateDialog = ref(false)

</script>

<template>
  <crud :entity="CovenantCrud.instance">
    <template v-slot:toolbar>
      <v-tooltip text="Crear Multiple" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-playlist-plus"
            @click="multiCreateDialog = true"
          />
        </template>
      </v-tooltip>
    </template>

    <template v-slot:item.date="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.group="{value}">{{value?.name}}</template>
    <template v-slot:item.createdBy="{value}">{{value?.name}}</template>
    <template v-slot:item.updatedBy="{value}">{{value?.name}}</template>
    <template v-slot:item.refuseBy="{value}">{{value?.name}}</template>
    <template v-slot:item.hora="{item}: {item: any}">
      {{item?.since}} - {{item?.until}}
    </template>
  </crud>

  <v-dialog v-model="multiCreateDialog" fullscreen>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Alta multiple de cobranzas</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="multiCreateDialog = false" />
      </v-toolbar>

      <v-card-text>
        <covenant-create-multi-form
          @close="multiCreateDialog = false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
