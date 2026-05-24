<script setup lang="ts">
import type { PropType } from 'vue'
import type { IEntityCrud } from '@drax/crud-share'
import { useI18n } from 'vue-i18n'
import { useCrudColumns } from '../../composables/UseCrudColumns'
import { useCrudButtonConfig } from '../../config/CrudButtonConfig'

const { t } = useI18n()
const buttonConfig = useCrudButtonConfig('columns')

const props = defineProps({
  entity: { type: Object as PropType<IEntityCrud>, required: true },
})

const {
  availableColumns,
  toggleColumn,
  allSelected,
  someSelected,
  selectAll,
  deselectAll
} = useCrudColumns(props.entity)
</script>

<template>
  <v-menu id="crud-columns-menu" class="crud-columns-menu" offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        id="crud-columns-button"
        class="crud-columns-button mr-1"
        icon
        :variant="buttonConfig.variant"
        :rounded="buttonConfig.rounded"
        :color="buttonConfig.color"
      >
        <v-icon id="crud-columns-button-icon" class="crud-columns-button__icon">{{ buttonConfig.icon }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ t('crud.columns.select') }}
        </v-tooltip>
      </v-btn>
    </template>
    <v-list id="crud-columns-list" class="crud-columns-menu__list">
      <v-list-subheader id="crud-columns-title" class="crud-columns-menu__title">
        {{ t('crud.columns.title') }}
      </v-list-subheader>

      <v-list-item id="crud-columns-bulk-actions" class="crud-columns-menu__bulk-actions">
        <div id="crud-columns-bulk-actions-content" class="crud-columns-menu__bulk-actions-content d-flex gap-2">
          <v-btn
            id="crud-columns-select-all-button"
            class="crud-columns-menu__select-all-button"
            size="small"
            variant="text"
            color="primary"
            @click="selectAll"
            :disabled="allSelected"
          >
            {{ t('crud.columns.selectAll') }}
          </v-btn>
          <v-btn
            id="crud-columns-deselect-all-button"
            class="crud-columns-menu__deselect-all-button"
            size="small"
            variant="text"
            color="primary"
            @click="deselectAll"
            :disabled="!someSelected"
          >
            {{ t('crud.columns.deselectAll') }}
          </v-btn>
        </div>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item
        v-for="column in availableColumns"
        :key="column.key"
        :id="`crud-columns-item-${column.key}`"
        class="crud-columns-menu__item"
        @click="toggleColumn(column.key)"
      >
        <template v-slot:prepend>
          <v-checkbox-btn
            :id="`crud-columns-checkbox-${column.key}`"
            class="crud-columns-menu__checkbox"
            :model-value="column.visible"
            @click.stop="toggleColumn(column.key)"
          ></v-checkbox-btn>
        </template>
        <v-list-item-title class="crud-columns-menu__item-title">{{ column.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
