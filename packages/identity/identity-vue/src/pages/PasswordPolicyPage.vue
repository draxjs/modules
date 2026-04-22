<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useAuth} from "../composables/useAuth";
import type {IPasswordPolicy} from "@drax/identity-front";

const {passwordPolicy} = useAuth()

const loading = ref(true)
const errorMsg = ref('')
const policy = ref<IPasswordPolicy | null>(null)

const rules = computed(() => {
  if (!policy.value) {
    return []
  }

  return [
    {
      label: `Longitud mínima de ${policy.value.minLength} caracteres`,
      enabled: true,
      icon: 'mdi-format-letter-case'
    },
    {
      label: `Longitud máxima de ${policy.value.maxLength} caracteres`,
      enabled: true,
      icon: 'mdi-ruler'
    },
    {
      label: 'Debe incluir al menos una mayúscula',
      enabled: policy.value.requireUppercase,
      icon: 'mdi-format-letter-case-upper'
    },
    {
      label: 'Debe incluir al menos una minúscula',
      enabled: policy.value.requireLowercase,
      icon: 'mdi-format-letter-case-lower'
    },
    {
      label: 'Debe incluir al menos un número',
      enabled: policy.value.requireNumber,
      icon: 'mdi-numeric'
    },
    {
      label: 'Debe incluir al menos un carácter especial',
      description: policy.value.allowedSpecialChars
          ? `Permitidos: ${policy.value.allowedSpecialChars}`
          : undefined,
      enabled: policy.value.requireSpecialChar,
      icon: 'mdi-asterisk'
    },
    {
      label: 'No se permiten espacios',
      enabled: policy.value.disallowSpaces,
      icon: 'mdi-keyboard-space'
    }
  ]
})

const metadata = computed(() => {
  if (!policy.value) {
    return []
  }

  const items = [
    {
      label: 'Reutilización',
      value: policy.value.preventReuse > 0
          ? `No se pueden repetir las últimas ${policy.value.preventReuse} contraseñas`
          : 'Sin restricción de reutilización'
    },
    {
      label: 'Expiración',
      value: policy.value.expirationDays
          ? `La contraseña expira cada ${policy.value.expirationDays} días`
          : 'Sin expiración configurada'
    }
  ]

  if (policy.value.requireSpecialChar && policy.value.allowedSpecialChars) {
    items.push({
      label: 'Caracteres especiales',
      value: policy.value.allowedSpecialChars
    })
  }

  return items
})

async function loadPolicy() {
  try {
    loading.value = true
    errorMsg.value = ''
    policy.value = await passwordPolicy()
  } catch (error) {
    const err = error as Error
    errorMsg.value = err.message || 'No se pudo obtener la política de contraseñas'
  } finally {
    loading.value = false
  }
}

onMounted(loadPolicy)
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="8" lg="6">
        <v-card variant="elevated">
          <v-card-title class="pa-4">
            Política de contraseñas
          </v-card-title>

          <v-card-text v-if="loading">
            <div class="text-medium-emphasis">Cargando política...</div>
          </v-card-text>

          <v-card-text v-else-if="errorMsg">
            <v-alert type="error" variant="tonal">
              {{ errorMsg }}
            </v-alert>
          </v-card-text>

          <template v-else-if="policy">
            <v-card-text class="pb-2">
              Requisitos que debe cumplir una contraseña válida.
            </v-card-text>

            <v-card-text class="pt-0">
              <v-list lines="two">
                <v-list-item
                    v-for="rule in rules"
                    :key="rule.label"
                    :prepend-icon="rule.icon"
                >
                  <v-list-item-title>{{ rule.label }}</v-list-item-title>
                  <v-list-item-subtitle v-if="rule.enabled && rule.description">
                    {{ rule.description }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip
                        :color="rule.enabled ? 'success' : 'default'"
                        size="small"
                        variant="tonal"
                    >
                      {{ rule.enabled ? 'Requerido' : 'Opcional' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-divider />

            <v-card-text>
              <v-row>
                <v-col
                    v-for="item in metadata"
                    :key="item.label"
                    cols="12"
                    sm="6"
                >
                  <v-sheet class="info-box pa-4 fill-height" rounded>
                    <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
                    <div class="text-body-1">{{ item.value }}</div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.info-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
