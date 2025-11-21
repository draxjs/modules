<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, computed } from 'vue'
import type { IEntityCrud } from "@drax/crud-share"
import { useI18n } from "vue-i18n"

const { t, te } = useI18n()

const props = defineProps({
  entity: { type: Object as PropType<IEntityCrud>, required: true }
})

const emit = defineEmits(['groupBy'])

const dialog = ref(false)
const selectedFields = ref<string[]>([])
const loading = ref(false)

// Obtener campos disponibles para agrupar (excluyendo algunos tipos)
const availableFields = computed(() => {
  return props.entity.fields
    .filter(field => {
      // Excluir campos que no son apropiados para agrupar
      const excludedTypes = ['password', 'longString', 'array.object', 'object', 'file', 'fullFile']
      return !excludedTypes.includes(field.type)
    })
    .map(field => ({
      value: field.name,
      title: te(`${props.entity.name.toLowerCase()}.field.${field.label}`)
        ? t(`${props.entity.name.toLowerCase()}.field.${field.label}`)
        : field.label
    }))
})

const handleGroupBy = async () => {
  if (selectedFields.value.length === 0) return

  loading.value = true
  try {
    emit('groupBy', selectedFields.value)
    dialog.value = false
  } finally {
    loading.value = false
  }
}

const resetAndClose = () => {
  selectedFields.value = []
  dialog.value = false
}
</script>

<template>
  <div>
    <v-btn
      icon
      variant="text"
      @click="dialog = true"
    >
      <v-icon>mdi-chart-bar</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ t('crud.groupby.button') }}
      </v-tooltip>
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-chart-bar</v-icon>
          {{ t('crud.groupby.dialog.title') }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-select
            v-model="selectedFields"
            :items="availableFields"
            :label="t('crud.groupby.dialog.selectFields')"
            multiple
            chips
            closable-chips
            :hint="t('crud.groupby.dialog.hint')"
            persistent-hint
          >
            <template v-slot:prepend-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-medium-emphasis">
                  {{ t('crud.groupby.dialog.description') }}
                </v-list-item-title>
              </v-list-item>
              <v-divider class="mb-2"></v-divider>
            </template>
          </v-select>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="resetAndClose"
            :disabled="loading"
          >
            {{ t('action.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleGroupBy"
            :disabled="selectedFields.length === 0"
            :loading="loading"
          >
            {{ t('crud.groupby.dialog.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
</style>
