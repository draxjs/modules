
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'

const { t, te } = useI18n()

const props = defineProps({
  label: {
    type: String,
    default: 'Icon'
  },
  variant: {
    type: String as PropType<'outlined' | 'filled' | 'solo' | 'plain' | 'underlined'>,
    default: 'outlined'
  },
  errorMessages: {
    type: [String, Array] as PropType<string | string[]>,
    default: () => []
  },
  clearable: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  density: {
    type: String as PropType<'default' | 'comfortable' | 'compact'>,
    default: 'default'
  },
  hideDetails: {
    type: Boolean,
    default: false
  },

  hint: {
    type: String,
    default: ''
  },
  persistentHint: {
    type: Boolean,
    default: false
  }
})

const model = defineModel<string>()

const search = ref('')
const showPreview = ref(true)

// Lista de iconos más comunes de Material Design Icons
const commonIcons = [
  'mdi-home',
  'mdi-account',
  'mdi-cog',
  'mdi-email',
  'mdi-phone',
  'mdi-calendar',
  'mdi-clock',
  'mdi-map-marker',
  'mdi-star',
  'mdi-heart',
  'mdi-thumb-up',
  'mdi-thumb-down',
  'mdi-check',
  'mdi-close',
  'mdi-plus',
  'mdi-minus',
  'mdi-pencil',
  'mdi-delete',
  'mdi-eye',
  'mdi-eye-off',
  'mdi-lock',
  'mdi-lock-open',
  'mdi-key',
  'mdi-shield',
  'mdi-alert',
  'mdi-information',
  'mdi-help',
  'mdi-bell',
  'mdi-message',
  'mdi-comment',
  'mdi-share',
  'mdi-download',
  'mdi-upload',
  'mdi-file',
  'mdi-folder',
  'mdi-image',
  'mdi-video',
  'mdi-music',
  'mdi-microphone',
  'mdi-camera',
  'mdi-printer',
  'mdi-magnify',
  'mdi-filter',
  'mdi-sort',
  'mdi-refresh',
  'mdi-sync',
  'mdi-cloud',
  'mdi-cloud-upload',
  'mdi-cloud-download',
  'mdi-database',
  'mdi-server',
  'mdi-laptop',
  'mdi-cellphone',
  'mdi-tablet',
  'mdi-monitor',
  'mdi-keyboard',
  'mdi-mouse',
  'mdi-wifi',
  'mdi-bluetooth',
  'mdi-network',
  'mdi-link',
  'mdi-bookmark',
  'mdi-tag',
  'mdi-flag',
  'mdi-chart-line',
  'mdi-chart-bar',
  'mdi-chart-pie',
  'mdi-table',
  'mdi-view-list',
  'mdi-view-grid',
  'mdi-view-module',
  'mdi-menu',
  'mdi-dots-vertical',
  'mdi-dots-horizontal',
  'mdi-arrow-up',
  'mdi-arrow-down',
  'mdi-arrow-left',
  'mdi-arrow-right',
  'mdi-chevron-up',
  'mdi-chevron-down',
  'mdi-chevron-left',
  'mdi-chevron-right',
  'mdi-unfold-more-horizontal',
  'mdi-unfold-less-horizontal',
  'mdi-play',
  'mdi-pause',
  'mdi-stop',
  'mdi-skip-next',
  'mdi-skip-previous',
  'mdi-volume-high',
  'mdi-volume-off',
  'mdi-brightness-6',
  'mdi-weather-sunny',
  'mdi-weather-night',
  'mdi-cart',
  'mdi-credit-card',
  'mdi-cash',
  'mdi-gift',
  'mdi-trophy',
  'mdi-medal',
  'mdi-school',
  'mdi-book',
  'mdi-library',
  'mdi-newspaper',
  'mdi-briefcase',
  'mdi-domain',
  'mdi-factory',
  'mdi-store',
  'mdi-hospital',
  'mdi-car',
  'mdi-bus',
  'mdi-train',
  'mdi-airplane',
  'mdi-ship',
  'mdi-bike',
  'mdi-walk',
  'mdi-run',
  'mdi-food',
  'mdi-coffee',
  'mdi-glass-cocktail',
  'mdi-pizza',
  'mdi-silverware',
  'mdi-account-group',
  'mdi-account-multiple',
  'mdi-account-circle',
  'mdi-account-box',
  'mdi-badge-account',
  'mdi-card-account-details',
  'mdi-clipboard-account',
  'mdi-format-bold',
  'mdi-format-italic',
  'mdi-format-underline',
  'mdi-format-list-bulleted',
  'mdi-format-list-numbered',
  'mdi-format-align-left',
  'mdi-format-align-center',
  'mdi-format-align-right',
  'mdi-palette',
  'mdi-brush',
  'mdi-draw',
  'mdi-scissors',
  'mdi-content-copy',
  'mdi-content-cut',
  'mdi-content-paste',
  'mdi-undo',
  'mdi-redo',
  'mdi-code-tags',
  'mdi-code-braces',
  'mdi-code-brackets',
  'mdi-xml',
  'mdi-console',
  'mdi-bug',
  'mdi-wrench',
  'mdi-hammer',
  'mdi-screwdriver',
  'mdi-power',
  'mdi-lightning-bolt',
  'mdi-fire',
  'mdi-water',
  'mdi-leaf',
  'mdi-tree',
  'mdi-flower',
  'mdi-earth',
  'mdi-moon',
  'mdi-star-outline',
  'mdi-rocket',
  'mdi-satellite',
  'mdi-telescope',
  'mdi-atom',
  'mdi-flask',
  'mdi-test-tube',
  'mdi-dna',
  'mdi-pill',
  'mdi-needle',
  'mdi-bandage',
  'mdi-thermometer',
  'mdi-scale',
  'mdi-timer',
  'mdi-alarm',
  'mdi-history',
  'mdi-update',
  'mdi-restore',
  'mdi-backup-restore',
  'mdi-package',
  'mdi-package-variant',
  'mdi-cube',
  'mdi-cube-outline',
  'mdi-layers',
  'mdi-layers-outline',
  'mdi-puzzle',
  'mdi-gamepad',
  'mdi-controller',
  'mdi-dice',
  'mdi-cards',
  'mdi-chess-knight',
  'mdi-soccer',
  'mdi-basketball',
  'mdi-football',
  'mdi-baseball',
  'mdi-tennis',
  'mdi-golf',
  'mdi-bowling',
  'mdi-pool',
  'mdi-dumbbell',
  'mdi-weight-lifter',
  'mdi-yoga',
  'mdi-meditation',
  'mdi-spa',
  'mdi-emoticon',
  'mdi-emoticon-happy',
  'mdi-emoticon-sad',
  'mdi-emoticon-cool',
  'mdi-emoticon-excited',
  'mdi-emoticon-neutral',
  'mdi-emoticon-angry',
  'mdi-emoticon-dead',
  'mdi-emoticon-tongue',
  'mdi-emoticon-wink',
  'mdi-hand-wave',
  'mdi-hand-peace',
  'mdi-hand-pointing-up',
  'mdi-hand-pointing-right',
  'mdi-hand-pointing-down',
  'mdi-hand-pointing-left',
  'mdi-fingerprint',
  'mdi-face-recognition',
  'mdi-qrcode',
  'mdi-barcode',
  'mdi-scan',
  'mdi-nfc',
  'mdi-radar',
  'mdi-target',
  'mdi-crosshairs',
  'mdi-bullseye',
  'mdi-map',
  'mdi-compass',
  'mdi-navigation',
  'mdi-directions',
  'mdi-road',
  'mdi-highway',
  'mdi-bridge',
  'mdi-tunnel',
  'mdi-gate',
  'mdi-door',
  'mdi-window',
  'mdi-stairs',
  'mdi-elevator',
  'mdi-escalator',
  'mdi-parking',
  'mdi-gas-station',
  'mdi-ev-station',
  'mdi-traffic-light',
  'mdi-sign-direction',
  'mdi-sign-caution',
  'mdi-sign-text',
  'mdi-equal',
  'mdi-not-equal',
  'mdi-greater-than',
  'mdi-greater-than-or-equal',
  'mdi-less-than',
  'mdi-less-than-or-equal',
  'mdi-code-array',
  'mdi-contain',
  'mdi-approximately-equal'
]

const filteredIcons = computed(() => {
  if (!search.value) {
    return commonIcons
  }
  const searchLower = search.value.toLowerCase()
  const filtered = commonIcons.filter(icon => icon.toLowerCase().includes(searchLower))

  // Si el valor de búsqueda no está en la lista y parece ser un icono válido (empieza con 'mdi-')
  // lo agregamos como opción personalizada
  if (search.value.startsWith('mdi-') && !commonIcons.includes(search.value)) {
    filtered.unshift(search.value)
  }

  return filtered
})

const displayLabel = computed(() => {
  return te(props.label) ? t(props.label) : props.label
})

// Actualizar el search cuando cambia el modelo
watch(model, (newValue) => {
  if (newValue && !search.value) {
    search.value = newValue
  }
})
</script>

<template>
  <v-combobox
    v-model="model"
    v-model:search="search"
    :label="displayLabel"
    :items="filteredIcons"
    :variant="variant"
    :error-messages="errorMessages"
    :clearable="clearable"
    :readonly="readonly"
    :density="density"
    :hide-details="hideDetails"
    :hint="hint"
    :persistent-hint="persistentHint"
    auto-select-first
  >
    <!-- Prepend icon slot - muestra el icono seleccionado -->
    <template v-slot:prepend-inner>
      <v-icon v-if="model && showPreview" :icon="model" />
    </template>

    <!-- Item slot - muestra cada icono en la lista -->
    <template v-slot:item="{ props: itemProps, item }">
      <v-list-item
        v-bind="itemProps"
        :prepend-icon="item.value"
        :title="item.value"
      />
    </template>

    <!-- Selection slot - muestra el icono seleccionado en el campo -->
    <template v-slot:selection="{ item }">
      <v-chip>
        <v-icon class="ml-1" :icon="item.value" start />
        {{ item.value }}
      </v-chip>
    </template>

    <!-- Append inner slot - botón para toggle preview -->
    <template v-slot:append-inner>
      <v-btn
        v-if="model"
        icon
        size="x-small"
        variant="text"
        @click.stop="showPreview = !showPreview"
      >
        <v-icon :icon="showPreview ? 'mdi-eye' : 'mdi-eye-off'" />
      </v-btn>
    </template>
  </v-combobox>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
