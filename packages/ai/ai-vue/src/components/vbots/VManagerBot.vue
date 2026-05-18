<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import VJarvisBot from './VJarvisBot.vue'
import VNexusBot from './VNexusBot.vue'
import VRobotBot from './VRobotBot.vue'

type BotKey = 'robot' | 'jarvis' | 'nexus'

const props = defineProps<{
  visible: boolean
  speaking: boolean
}>()

const storageKey = 'drax.visualBot.selected'
const robotOption = {
  key: 'robot' as const,
  label: 'Robot',
  icon: 'mdi-robot-outline',
  component: VRobotBot,
}
const jarvisOption = {
  key: 'jarvis' as const,
  label: 'Jarvis',
  icon: 'mdi-hexagon-multiple-outline',
  component: VJarvisBot,
}
const nexusOption = {
  key: 'nexus' as const,
  label: 'Nexus',
  icon: 'mdi-atom',
  component: VNexusBot,
}
const botOptions = [robotOption, jarvisOption, nexusOption]

function readStoredBot(): BotKey {
  if (typeof window === 'undefined') {
    return 'robot'
  }

  const stored = safeLocalStorageGet(storageKey)

  if (stored === 'robot' || stored === 'jarvis' || stored === 'nexus') {
    return stored
  }

  return 'robot'
}

function safeLocalStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Selection persistence is optional.
  }
}

const selectedBot = ref<BotKey>(readStoredBot())
const selectedOption = computed(() => (
  botOptions.find((option) => option.key === selectedBot.value) ?? robotOption
))

watch(selectedBot, (value) => {
  if (typeof window !== 'undefined') {
    safeLocalStorageSet(storageKey, value)
  }
})
</script>

<template>
  <v-menu
    v-if="props.visible"
    location="top end"
    :close-on-content-click="true"
  >
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        class="visual-bot-manager"
        type="button"
        :aria-label="`Seleccionar bot visual. Actual: ${selectedOption.label}`"
        :title="`Bot visual: ${selectedOption.label}`"
      >
        <component
          :is="selectedOption.component"
          :visible="props.visible"
          :speaking="props.speaking"
        />
      </button>
    </template>

    <v-list
      class="visual-bot-manager__list"
      density="compact"
      lines="one"
    >
      <v-list-subheader>Bot visual</v-list-subheader>
      <v-list-item
        v-for="option in botOptions"
        :key="option.key"
        :active="selectedBot === option.key"
        @click="selectedBot = option.key"
      >
        <template #prepend>
          <v-icon
            :icon="selectedBot === option.key ? 'mdi-check' : option.icon"
            size="small"
          />
        </template>
        <v-list-item-title>{{ option.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.visual-bot-manager {
  --visual-bot-scale: 1;

  position: relative;
  align-self: center;
  justify-self: center;
  width: calc(141px * var(--visual-bot-scale));
  height: calc(141px * var(--visual-bot-scale));
  display: grid;
  place-items: center;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.visual-bot-manager:focus-visible {
  outline: 3px solid rgba(var(--v-theme-primary), 0.42);
  outline-offset: 4px;
}

.visual-bot-manager :deep(.visual-bot) {
  --visual-bot-scale: inherit;
}

.visual-bot-manager__list {
  min-width: 172px;
}

@media (max-width: 700px) {
  .visual-bot-manager {
    --visual-bot-scale: 0.7;
  }
}
</style>
