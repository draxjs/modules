<script setup lang="ts">
import {ref} from 'vue'
import GroupZoneCombobox from '../comboboxes/GroupZoneCombobox.vue'
import CovenantProvider from '../providers/CovenantProvider'

const formRef = ref()
const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  date: getTodayDate(),
  group: null as string | null,
})
const requiredRule = (value: unknown) => !!value || 'Requerido'

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function resolveFileName(response: Response) {
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const match = contentDisposition.match(/filename=\"?([^"]+)\"?/)
  return match?.[1] ?? `convenios_${form.value.date}.xlsx`
}

async function exportExcel() {
  error.value = ''
  success.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid || !form.value.group) {
    return
  }

  loading.value = true

  try {
    const isoDate = new Date(`${form.value.date}T00:00:00`).toISOString()
    const response = await CovenantProvider.instance.exportExcel(isoDate, form.value.group)

    if (!response.ok) {
      let message = 'No se pudo exportar el archivo.'

      try {
        const body = await response.json()
        message = body?.message ?? message
      } catch {
        // ignore invalid json error bodies
      }

      throw new Error(message)
    }

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = resolveFileName(response)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)

    success.value = 'El archivo Excel se genero correctamente.'
  } catch (e: any) {
    error.value = e?.message ?? 'Ocurrio un error al exportar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="export-card">
          <v-card-item>
            <v-card-title>Exportar convenios</v-card-title>
            <v-card-subtitle>
              Genera el Excel para una fecha y grupo especificos.
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-form ref="formRef" @submit.prevent="exportExcel">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.date"
                    label="Fecha"
                    type="date"
                    variant="outlined"
                    :rules="[requiredRule]"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <GroupZoneCombobox
                    v-model="form.group"
                    label="Grupo"
                    variant="outlined"
                    :rules="[requiredRule]"
                    :hide-details="true"
                  />
                </v-col>

                <v-col cols="12">
                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ error }}
                  </v-alert>

                  <v-alert
                    v-if="success"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ success }}
                  </v-alert>

                  <div class="d-flex justify-end">
                    <v-btn
                      color="primary"
                      :loading="loading"
                      prepend-icon="mdi-file-excel-outline"
                      @click="exportExcel"
                    >
                      Exportar Excel
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.export-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
