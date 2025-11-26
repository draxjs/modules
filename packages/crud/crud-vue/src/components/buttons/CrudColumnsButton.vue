<script setup lang="ts">
import type { PropType } from 'vue'
import type { IEntityCrud } from '@drax/crud-share'
import { useI18n } from 'vue-i18n'
import { useCrudColumns } from '../../composables/UseCrudColumns'

const { t } = useI18n()

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
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
      >
        <v-icon>mdi-view-column</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ t('crud.columns.select') }}
        </v-tooltip>
      </v-btn>
    </template>
    <v-list>
      <v-list-subheader>
        {{ t('crud.columns.title') }}
      </v-list-subheader>

      <v-list-item>
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="selectAll"
            :disabled="allSelected"
          >
            {{ t('crud.columns.selectAll') }}
          </v-btn>
          <v-btn
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
        @click="toggleColumn(column.key)"
      >
        <template v-slot:prepend>
          <v-checkbox-btn
            :model-value="column.visible"
            @click.stop="toggleColumn(column.key)"
          ></v-checkbox-btn>
        </template>
        <v-list-item-title>{{ column.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
