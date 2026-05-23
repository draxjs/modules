<script setup lang="ts">
import {useEntityStore} from '../../stores/UseEntityStore'
import {useI18n} from 'vue-i18n'
import type {IEntityCrud} from "@drax/crud-share"

const valueModel = defineModel()
const entityStore = useEntityStore()
const {t,te} =  useI18n()

const getEntityLabel = (entity: IEntityCrud) => {
  const key = entity?.name?.toLowerCase() + '.entity'
  return te(key) ? t(key) : entity?.name
}

</script>

<template>

  <v-select
  id="entity-combobox"
  class="entity-combobox"
  :items="entityStore.entities"
  item-value="name"
  v-model="valueModel"
  :label="t('crud.entity')"
  v-bind="$attrs"

  >

    <template v-slot:item="{ props: itemProps, item }">
      <v-list-item
          v-bind="itemProps"
          :id="`entity-combobox-item-${(item.raw as IEntityCrud).name}`"
          class="entity-combobox__item"
          density="compact"
          :title="getEntityLabel(item.raw as IEntityCrud)"

      />
    </template>

    <template v-slot:selection="{item}">
      {{ getEntityLabel(item.raw as IEntityCrud) }}
    </template>
  </v-select>

</template>

<style scoped>

</style>
