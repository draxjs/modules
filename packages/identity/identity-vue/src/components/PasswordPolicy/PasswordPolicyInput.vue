<script setup lang="ts">
import {computed, ref, useAttrs} from "vue";
import {useI18n} from "vue-i18n";
import {useDisplay} from "vuetify";
import PasswordPolicySummary from "./PasswordPolicySummary.vue";

defineOptions({
  inheritAttrs: false
})

const modelValue = defineModel<string>({
  default: ''
})

const attrs = useAttrs()
const {t} = useI18n()
const {xs} = useDisplay()

const props = withDefaults(defineProps<{
  id?: string
  label?: string
  variant?: 'outlined' | 'plain' | 'filled' | 'solo' | 'solo-filled' | 'solo-inverted' | 'underlined'
  rules?: Array<(value: string) => boolean | string>
  errorMessages?: string | string[]
  readonly?: boolean
  required?: boolean
  autocomplete?: string
  prependInnerIcon?: string
  showPolicyLink?: boolean
}>(), {
  id: undefined,
  label: undefined,
  variant: 'outlined',
  rules: () => [],
  errorMessages: () => [],
  readonly: false,
  required: false,
  autocomplete: 'new-password',
  prependInnerIcon: 'mdi-lock-outline',
  showPolicyLink: true
})

const isVisible = ref(false)
const inputType = computed(() => isVisible.value ? 'text' : 'password')
const visibilityIcon = computed(() => isVisible.value ? 'mdi-eye-off' : 'mdi-eye')
const policyLinkLabel = computed(() => t(xs.value ? 'user.passwordPolicy.linkShort' : 'user.passwordPolicy.link'))

function toggleVisibility() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <v-text-field
      v-bind="attrs"
      :id="id"
      v-model="modelValue"
      :label="label"
      :type="inputType"
      :variant="variant"
      :rules="rules"
      :required="required"
      :prepend-inner-icon="prependInnerIcon"
      :autocomplete="autocomplete"
      :error-messages="errorMessages"
      :readonly="readonly"
  >
    <template #append-inner>
      <div
          v-if="showPolicyLink"
          class="password-policy-link-wrapper mb-2"
      >
        <v-menu
            open-on-hover
            location="top end"
            :close-delay="120"
            :open-delay="120"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
                v-bind="menuProps"
                tabindex="-1"
                variant="text"
                color="grey"
                size="small"
                class="mt-2"
            >
              {{ policyLinkLabel }}
            </v-btn>
          </template>

          <v-card class="password-policy-menu" rounded="lg">
            <v-card-text class="pa-3">
              <PasswordPolicySummary variant="compact" />
            </v-card-text>
          </v-card>
        </v-menu>
      </div>

      <v-icon
          :icon="visibilityIcon"
          @click="toggleVisibility"
      />
    </template>
  </v-text-field>
</template>

<style scoped>
.password-policy-link-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 4px;
}

.password-policy-menu {
  max-width: 400px;
}
</style>
