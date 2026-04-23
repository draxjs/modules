<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useAuth} from "../../composables/useAuth";
import type {IPasswordPolicy} from "@drax/identity-front";

const props = withDefaults(defineProps<{
  variant?: 'compact' | 'full'
}>(), {
  variant: 'full'
})

const {t} = useI18n()
const {passwordPolicy} = useAuth()

const loading = ref(true)
const errorMsg = ref('')
const policy = ref<IPasswordPolicy | null>(null)

const compact = computed(() => props.variant === 'compact')

const rules = computed(() => {
  if (!policy.value) {
    return []
  }

  return [
    {
      label: t('user.passwordPolicy.minLength', {count: policy.value.minLength}),
      enabled: true,
      icon: 'mdi-format-letter-case'
    },
    {
      label: t('user.passwordPolicy.maxLength', {count: policy.value.maxLength}),
      enabled: true,
      icon: 'mdi-ruler'
    },
    {
      label: t('user.passwordPolicy.requireUppercase'),
      enabled: policy.value.requireUppercase,
      icon: 'mdi-format-letter-case-upper'
    },
    {
      label: t('user.passwordPolicy.requireLowercase'),
      enabled: policy.value.requireLowercase,
      icon: 'mdi-format-letter-case-lower'
    },
    {
      label: t('user.passwordPolicy.requireNumber'),
      enabled: policy.value.requireNumber,
      icon: 'mdi-numeric'
    },
    {
      label: t('user.passwordPolicy.requireSpecialChar'),
      description: policy.value.allowedSpecialChars
          ? t('user.passwordPolicy.specialCharsAllowed', {chars: policy.value.allowedSpecialChars})
          : undefined,
      enabled: policy.value.requireSpecialChar,
      icon: 'mdi-asterisk'
    },
    {
      label: t('user.passwordPolicy.disallowSpaces'),
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
      label: t('user.passwordPolicy.reuseLabel'),
      value: policy.value.preventReuse > 0
          ? t('user.passwordPolicy.reuseValue', {count: policy.value.preventReuse})
          : t('user.passwordPolicy.reuseNone')
    },
    {
      label: t('user.passwordPolicy.expirationLabel'),
      value: policy.value.expirationDays
          ? t('user.passwordPolicy.expirationValue', {count: policy.value.expirationDays})
          : t('user.passwordPolicy.expirationNone')
    }
  ]

  if (policy.value.requireSpecialChar && policy.value.allowedSpecialChars) {
    items.push({
      label: t('user.passwordPolicy.specialCharsLabel'),
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
    errorMsg.value = err.message || t('user.passwordPolicy.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(loadPolicy)
</script>

<template>
  <div>
    <div
        v-if="loading"
        :class="compact ? 'text-caption text-medium-emphasis' : 'text-medium-emphasis'"
    >
      {{ t('user.passwordPolicy.loading') }}
    </div>

    <v-alert
        v-else-if="errorMsg"
        type="error"
        variant="tonal"
        :density="compact ? 'compact' : 'default'"
    >
      {{ errorMsg }}
    </v-alert>

    <template v-else-if="policy">
      <template v-if="compact">
        <div class="text-caption text-medium-emphasis mb-2">
          {{ t('user.passwordPolicy.description') }}
        </div>

        <v-list class="py-0" density="compact" lines="two">
          <v-list-item
              v-for="rule in rules"
              :key="rule.label"
              class="px-0"
              :prepend-icon="rule.icon"
          >
            <v-list-item-title class="text-body-2 policy-text-wrap">
              {{ rule.label }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="rule.enabled && rule.description" class="text-caption policy-text-wrap">
              {{ rule.description }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip
                  :color="rule.enabled ? 'success' : 'default'"
                  size="x-small"
                  variant="tonal"
              >
                {{ rule.enabled ? t('user.passwordPolicy.required') : t('user.passwordPolicy.optional') }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <v-divider class="my-2" />

        <div class="compact-meta">
          <div v-for="item in metadata" :key="item.label" class="compact-meta-item">
            <span class="text-caption text-medium-emphasis">{{ item.label }}:</span>
            <span class="text-body-2">{{ item.value }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-body-1 mb-4">
          {{ t('user.passwordPolicy.description') }}
        </div>

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
                {{ rule.enabled ? t('user.passwordPolicy.required') : t('user.passwordPolicy.optional') }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-row class="mt-1">
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
      </template>
    </template>
  </div>
</template>

<style scoped>
.compact-meta {
  display: grid;
  gap: 6px;
}

.compact-meta-item {
  display: flex;
  gap: 6px;
  align-items: baseline;
  flex-wrap: wrap;
}

.policy-text-wrap {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  word-break: break-word;
}

.info-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
