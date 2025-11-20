<script setup lang="ts">
import { ref, defineModel } from 'vue'
import type { PropType } from 'vue'

defineProps({
  label: {
    type: String,
    default: 'Color'
  },
  variant: {
    type: String as PropType<'outlined' | 'filled' | 'underlined' | 'plain' | 'solo' | 'solo-inverted' | 'solo-filled'>,
    default: 'outlined'
  },
  density: {
    type: String as PropType<'default' | 'comfortable' | 'compact'>,
    default: 'default'
  },
  clearable: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  hideDetails: {
    type: Boolean,
    default: false
  },
  errorMessages: {
    type: [String, Array] as PropType<string | string[]>,
    default: undefined
  },
  rules: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})

const model = defineModel<string>()

const colors = ref([
  // Red
  { title: 'Red', value: 'red', color: '#F44336' },
  { title: 'Red Lighten 5', value: 'red-lighten-5', color: '#FFEBEE' },
  { title: 'Red Lighten 4', value: 'red-lighten-4', color: '#FFCDD2' },
  { title: 'Red Lighten 3', value: 'red-lighten-3', color: '#EF9A9A' },
  { title: 'Red Lighten 2', value: 'red-lighten-2', color: '#E57373' },
  { title: 'Red Lighten 1', value: 'red-lighten-1', color: '#EF5350' },
  { title: 'Red Darken 1', value: 'red-darken-1', color: '#E53935' },
  { title: 'Red Darken 2', value: 'red-darken-2', color: '#D32F2F' },
  { title: 'Red Darken 3', value: 'red-darken-3', color: '#C62828' },
  { title: 'Red Darken 4', value: 'red-darken-4', color: '#B71C1C' },
  { title: 'Red Accent 1', value: 'red-accent-1', color: '#FF8A80' },
  { title: 'Red Accent 2', value: 'red-accent-2', color: '#FF5252' },
  { title: 'Red Accent 3', value: 'red-accent-3', color: '#FF1744' },
  { title: 'Red Accent 4', value: 'red-accent-4', color: '#D50000' },

  // Pink
  { title: 'Pink', value: 'pink', color: '#E91E63' },
  { title: 'Pink Lighten 5', value: 'pink-lighten-5', color: '#FCE4EC' },
  { title: 'Pink Lighten 4', value: 'pink-lighten-4', color: '#F8BBD0' },
  { title: 'Pink Lighten 3', value: 'pink-lighten-3', color: '#F48FB1' },
  { title: 'Pink Lighten 2', value: 'pink-lighten-2', color: '#F06292' },
  { title: 'Pink Lighten 1', value: 'pink-lighten-1', color: '#EC407A' },
  { title: 'Pink Darken 1', value: 'pink-darken-1', color: '#D81B60' },
  { title: 'Pink Darken 2', value: 'pink-darken-2', color: '#C2185B' },
  { title: 'Pink Darken 3', value: 'pink-darken-3', color: '#AD1457' },
  { title: 'Pink Darken 4', value: 'pink-darken-4', color: '#880E4F' },
  { title: 'Pink Accent 1', value: 'pink-accent-1', color: '#FF80AB' },
  { title: 'Pink Accent 2', value: 'pink-accent-2', color: '#FF4081' },
  { title: 'Pink Accent 3', value: 'pink-accent-3', color: '#F50057' },
  { title: 'Pink Accent 4', value: 'pink-accent-4', color: '#C51162' },

  // Purple
  { title: 'Purple', value: 'purple', color: '#9C27B0' },
  { title: 'Purple Lighten 5', value: 'purple-lighten-5', color: '#F3E5F5' },
  { title: 'Purple Lighten 4', value: 'purple-lighten-4', color: '#E1BEE7' },
  { title: 'Purple Lighten 3', value: 'purple-lighten-3', color: '#CE93D8' },
  { title: 'Purple Lighten 2', value: 'purple-lighten-2', color: '#BA68C8' },
  { title: 'Purple Lighten 1', value: 'purple-lighten-1', color: '#AB47BC' },
  { title: 'Purple Darken 1', value: 'purple-darken-1', color: '#8E24AA' },
  { title: 'Purple Darken 2', value: 'purple-darken-2', color: '#7B1FA2' },
  { title: 'Purple Darken 3', value: 'purple-darken-3', color: '#6A1B9A' },
  { title: 'Purple Darken 4', value: 'purple-darken-4', color: '#4A148C' },
  { title: 'Purple Accent 1', value: 'purple-accent-1', color: '#EA80FC' },
  { title: 'Purple Accent 2', value: 'purple-accent-2', color: '#E040FB' },
  { title: 'Purple Accent 3', value: 'purple-accent-3', color: '#D500F9' },
  { title: 'Purple Accent 4', value: 'purple-accent-4', color: '#AA00FF' },

  // Deep Purple
  { title: 'Deep Purple', value: 'deep-purple', color: '#673AB7' },
  { title: 'Deep Purple Lighten 5', value: 'deep-purple-lighten-5', color: '#EDE7F6' },
  { title: 'Deep Purple Lighten 4', value: 'deep-purple-lighten-4', color: '#D1C4E9' },
  { title: 'Deep Purple Lighten 3', value: 'deep-purple-lighten-3', color: '#B39DDB' },
  { title: 'Deep Purple Lighten 2', value: 'deep-purple-lighten-2', color: '#9575CD' },
  { title: 'Deep Purple Lighten 1', value: 'deep-purple-lighten-1', color: '#7E57C2' },
  { title: 'Deep Purple Darken 1', value: 'deep-purple-darken-1', color: '#5E35B1' },
  { title: 'Deep Purple Darken 2', value: 'deep-purple-darken-2', color: '#512DA8' },
  { title: 'Deep Purple Darken 3', value: 'deep-purple-darken-3', color: '#4527A0' },
  { title: 'Deep Purple Darken 4', value: 'deep-purple-darken-4', color: '#311B92' },
  { title: 'Deep Purple Accent 1', value: 'deep-purple-accent-1', color: '#B388FF' },
  { title: 'Deep Purple Accent 2', value: 'deep-purple-accent-2', color: '#7C4DFF' },
  { title: 'Deep Purple Accent 3', value: 'deep-purple-accent-3', color: '#651FFF' },
  { title: 'Deep Purple Accent 4', value: 'deep-purple-accent-4', color: '#6200EA' },

  // Indigo
  { title: 'Indigo', value: 'indigo', color: '#3F51B5' },
  { title: 'Indigo Lighten 5', value: 'indigo-lighten-5', color: '#E8EAF6' },
  { title: 'Indigo Lighten 4', value: 'indigo-lighten-4', color: '#C5CAE9' },
  { title: 'Indigo Lighten 3', value: 'indigo-lighten-3', color: '#9FA8DA' },
  { title: 'Indigo Lighten 2', value: 'indigo-lighten-2', color: '#7986CB' },
  { title: 'Indigo Lighten 1', value: 'indigo-lighten-1', color: '#5C6BC0' },
  { title: 'Indigo Darken 1', value: 'indigo-darken-1', color: '#3949AB' },
  { title: 'Indigo Darken 2', value: 'indigo-darken-2', color: '#303F9F' },
  { title: 'Indigo Darken 3', value: 'indigo-darken-3', color: '#283593' },
  { title: 'Indigo Darken 4', value: 'indigo-darken-4', color: '#1A237E' },
  { title: 'Indigo Accent 1', value: 'indigo-accent-1', color: '#8C9EFF' },
  { title: 'Indigo Accent 2', value: 'indigo-accent-2', color: '#536DFE' },
  { title: 'Indigo Accent 3', value: 'indigo-accent-3', color: '#3D5AFE' },
  { title: 'Indigo Accent 4', value: 'indigo-accent-4', color: '#304FFE' },

  // Blue
  { title: 'Blue', value: 'blue', color: '#2196F3' },
  { title: 'Blue Lighten 5', value: 'blue-lighten-5', color: '#E3F2FD' },
  { title: 'Blue Lighten 4', value: 'blue-lighten-4', color: '#BBDEFB' },
  { title: 'Blue Lighten 3', value: 'blue-lighten-3', color: '#90CAF9' },
  { title: 'Blue Lighten 2', value: 'blue-lighten-2', color: '#64B5F6' },
  { title: 'Blue Lighten 1', value: 'blue-lighten-1', color: '#42A5F5' },
  { title: 'Blue Darken 1', value: 'blue-darken-1', color: '#1E88E5' },
  { title: 'Blue Darken 2', value: 'blue-darken-2', color: '#1976D2' },
  { title: 'Blue Darken 3', value: 'blue-darken-3', color: '#1565C0' },
  { title: 'Blue Darken 4', value: 'blue-darken-4', color: '#0D47A1' },
  { title: 'Blue Accent 1', value: 'blue-accent-1', color: '#82B1FF' },
  { title: 'Blue Accent 2', value: 'blue-accent-2', color: '#448AFF' },
  { title: 'Blue Accent 3', value: 'blue-accent-3', color: '#2979FF' },
  { title: 'Blue Accent 4', value: 'blue-accent-4', color: '#2962FF' },

  // Light Blue
  { title: 'Light Blue', value: 'light-blue', color: '#03A9F4' },
  { title: 'Light Blue Lighten 5', value: 'light-blue-lighten-5', color: '#E1F5FE' },
  { title: 'Light Blue Lighten 4', value: 'light-blue-lighten-4', color: '#B3E5FC' },
  { title: 'Light Blue Lighten 3', value: 'light-blue-lighten-3', color: '#81D4FA' },
  { title: 'Light Blue Lighten 2', value: 'light-blue-lighten-2', color: '#4FC3F7' },
  { title: 'Light Blue Lighten 1', value: 'light-blue-lighten-1', color: '#29B6F6' },
  { title: 'Light Blue Darken 1', value: 'light-blue-darken-1', color: '#039BE5' },
  { title: 'Light Blue Darken 2', value: 'light-blue-darken-2', color: '#0288D1' },
  { title: 'Light Blue Darken 3', value: 'light-blue-darken-3', color: '#0277BD' },
  { title: 'Light Blue Darken 4', value: 'light-blue-darken-4', color: '#01579B' },
  { title: 'Light Blue Accent 1', value: 'light-blue-accent-1', color: '#80D8FF' },
  { title: 'Light Blue Accent 2', value: 'light-blue-accent-2', color: '#40C4FF' },
  { title: 'Light Blue Accent 3', value: 'light-blue-accent-3', color: '#00B0FF' },
  { title: 'Light Blue Accent 4', value: 'light-blue-accent-4', color: '#0091EA' },

  // Cyan
  { title: 'Cyan', value: 'cyan', color: '#00BCD4' },
  { title: 'Cyan Lighten 5', value: 'cyan-lighten-5', color: '#E0F7FA' },
  { title: 'Cyan Lighten 4', value: 'cyan-lighten-4', color: '#B2EBF2' },
  { title: 'Cyan Lighten 3', value: 'cyan-lighten-3', color: '#80DEEA' },
  { title: 'Cyan Lighten 2', value: 'cyan-lighten-2', color: '#4DD0E1' },
  { title: 'Cyan Lighten 1', value: 'cyan-lighten-1', color: '#26C6DA' },
  { title: 'Cyan Darken 1', value: 'cyan-darken-1', color: '#00ACC1' },
  { title: 'Cyan Darken 2', value: 'cyan-darken-2', color:'#0097A7' },
  { title: 'Cyan Darken 3', value: 'cyan-darken-3', color: '#00838F' },
  { title: 'Cyan Darken 4', value: 'cyan-darken-4', color: '#006064' },
  { title: 'Cyan Accent 1', value: 'cyan-accent-1', color: '#84FFFF' },
  { title: 'Cyan Accent 2', value: 'cyan-accent-2', color: '#18FFFF' },
  { title: 'Cyan Accent 3', value: 'cyan-accent-3', color: '#00E5FF' },
  { title: 'Cyan Accent 4', value: 'cyan-accent-4', color: '#00B8D4' },

  // Teal
  { title: 'Teal', value: 'teal', color: '#009688' },
  { title: 'Teal Lighten 5', value: 'teal-lighten-5', color: '#E0F2F1' },
  { title: 'Teal Lighten 4', value: 'teal-lighten-4', color: '#B2DFDB' },
  { title: 'Teal Lighten 3', value: 'teal-lighten-3', color: '#80CBC4' },
  { title: 'Teal Lighten 2', value: 'teal-lighten-2', color: '#4DB6AC' },
  { title: 'Teal Lighten 1', value: 'teal-lighten-1', color: '#26A69A' },
  { title: 'Teal Darken 1', value: 'teal-darken-1', color: '#00897B' },
  { title: 'Teal Darken 2', value: 'teal-darken-2', color: '#00796B' },
  { title: 'Teal Darken 3', value: 'teal-darken-3', color: '#00695C' },
  { title: 'Teal Darken 4', value: 'teal-darken-4', color: '#004D40' },
  { title: 'Teal Accent 1', value: 'teal-accent-1', color: '#A7FFEB' },
  { title: 'Teal Accent 2', value: 'teal-accent-2', color: '#64FFDA' },
  { title: 'Teal Accent 3', value: 'teal-accent-3', color: '#1DE9B6' },
  { title: 'Teal Accent 4', value: 'teal-accent-4', color: '#00BFA5' },

  // Green
  { title: 'Green', value: 'green', color: '#4CAF50' },
  { title: 'Green Lighten 5', value: 'green-lighten-5', color: '#E8F5E9' },
  { title: 'Green Lighten 4', value: 'green-lighten-4', color: '#C8E6C9' },
  { title: 'Green Lighten 3', value: 'green-lighten-3', color: '#A5D6A7' },
  { title: 'Green Lighten 2', value: 'green-lighten-2', color: '#81C784' },
  { title: 'Green Lighten 1', value: 'green-lighten-1', color: '#66BB6A' },
  { title: 'Green Darken 1', value: 'green-darken-1', color: '#43A047' },
  { title: 'Green Darken 2', value: 'green-darken-2', color: '#388E3C' },
  { title: 'Green Darken 3', value: 'green-darken-3', color: '#2E7D32' },
  { title: 'Green Darken 4', value: 'green-darken-4', color: '#1B5E20' },
  { title: 'Green Accent 1', value: 'green-accent-1', color: '#B9F6CA' },
  { title: 'Green Accent 2', value: 'green-accent-2', color: '#69F0AE' },
  { title: 'Green Accent 3', value: 'green-accent-3', color: '#00E676' },
  { title: 'Green Accent 4', value: 'green-accent-4', color: '#00C853' },

  // Light Green
  { title: 'Light Green', value: 'light-green', color: '#8BC34A' },
  { title: 'Light Green Lighten 5', value: 'light-green-lighten-5', color: '#F1F8E9' },
  { title: 'Light Green Lighten 4', value: 'light-green-lighten-4', color: '#DCEDC8' },
  { title: 'Light Green Lighten 3', value: 'light-green-lighten-3', color: '#C5E1A5' },
  { title: 'Light Green Lighten 2', value: 'light-green-lighten-2', color: '#AED581' },
  { title: 'Light Green Lighten 1', value: 'light-green-lighten-1', color: '#9CCC65' },
  { title: 'Light Green Darken 1', value: 'light-green-darken-1', color: '#7CB342' },
  { title: 'Light Green Darken 2', value: 'light-green-darken-2', color: '#689F38' },
  { title: 'Light Green Darken 3', value: 'light-green-darken-3', color: '#558B2F' },
  { title: 'Light Green Darken 4', value: 'light-green-darken-4', color: '#33691E' },
  { title: 'Light Green Accent 1', value: 'light-green-accent-1', color: '#CCFF90' },
  { title: 'Light Green Accent 2', value: 'light-green-accent-2', color: '#B2FF59' },
  { title: 'Light Green Accent 3', value: 'light-green-accent-3', color: '#76FF03' },
  { title: 'Light Green Accent 4', value: 'light-green-accent-4', color: '#64DD17' },

  // Lime
  { title: 'Lime', value: 'lime', color: '#CDDC39' },
  { title: 'Lime Lighten 5', value: 'lime-lighten-5', color: '#F9FBE7' },
  { title: 'Lime Lighten 4', value: 'lime-lighten-4', color: '#F0F4C3' },
  { title: 'Lime Lighten 3', value: 'lime-lighten-3', color: '#E6EE9C' },
  { title: 'Lime Lighten 2', value: 'lime-lighten-2', color: '#DCE775' },
  { title: 'Lime Lighten 1', value: 'lime-lighten-1', color: '#D4E157' },
  { title: 'Lime Darken 1', value: 'lime-darken-1', color: '#C0CA33' },
  { title: 'Lime Darken 2', value: 'lime-darken-2', color: '#AFB42B' },
  { title: 'Lime Darken 3', value: 'lime-darken-3', color: '#9E9D24' },
  { title: 'Lime Darken 4', value: 'lime-darken-4', color: '#827717' },
  { title: 'Lime Accent 1', value: 'lime-accent-1', color: '#F4FF81' },
  { title: 'Lime Accent 2', value: 'lime-accent-2', color: '#EEFF41' },
  { title: 'Lime Accent 3', value: 'lime-accent-3', color: '#C6FF00' },
  { title: 'Lime Accent 4', value: 'lime-accent-4', color: '#AEEA00' },

  // Yellow
  { title: 'Yellow', value: 'yellow', color: '#FFEB3B' },
  { title: 'Yellow Lighten 5', value: 'yellow-lighten-5', color: '#FFFDE7' },
  { title: 'Yellow Lighten 4', value: 'yellow-lighten-4', color: '#FFF9C4' },
  { title: 'Yellow Lighten 3', value: 'yellow-lighten-3', color: '#FFF59D' },
  { title: 'Yellow Lighten 2', value: 'yellow-lighten-2', color: '#FFF176' },
  { title: 'Yellow Lighten 1', value: 'yellow-lighten-1', color: '#FFEE58' },
  { title: 'Yellow Darken 1', value: 'yellow-darken-1', color: '#FDD835' },
  { title: 'Yellow Darken 2', value: 'yellow-darken-2', color: '#FBC02D' },
  { title: 'Yellow Darken 3', value: 'yellow-darken-3', color: '#F9A825' },
  { title: 'Yellow Darken 4', value: 'yellow-darken-4', color: '#F57F17' },
  { title: 'Yellow Accent 1', value: 'yellow-accent-1', color: '#FFFF8D' },
  { title: 'Yellow Accent 2', value: 'yellow-accent-2', color: '#FFFF00' },
  { title: 'Yellow Accent 3', value: 'yellow-accent-3', color: '#FFEA00' },
  { title: 'Yellow Accent 4', value: 'yellow-accent-4', color: '#FFD600' },

  // Amber
  { title: 'Amber', value: 'amber', color: '#FFC107' },
  { title: 'Amber Lighten 5', value: 'amber-lighten-5', color: '#FFF8E1' },
  { title: 'Amber Lighten 4', value: 'amber-lighten-4', color: '#FFECB3' },
  { title: 'Amber Lighten 3', value: 'amber-lighten-3', color: '#FFE082' },
  { title: 'Amber Lighten 2', value: 'amber-lighten-2', color: '#FFD54F' },
  { title: 'Amber Lighten 1', value: 'amber-lighten-1', color: '#FFCA28' },
  { title: 'Amber Darken 1', value: 'amber-darken-1', color: '#FFB300' },
  { title: 'Amber Darken 2', value: 'amber-darken-2', color: '#FFA000' },
  { title: 'Amber Darken 3', value: 'amber-darken-3', color: '#FF8F00' },
  { title: 'Amber Darken 4', value: 'amber-darken-4', color: '#FF6F00' },
  { title: 'Amber Accent 1', value: 'amber-accent-1', color: '#FFE57F' },
  { title: 'Amber Accent 2', value: 'amber-accent-2', color: '#FFD740' },
  { title: 'Amber Accent 3', value: 'amber-accent-3', color: '#FFC400' },
  { title: 'Amber Accent 4', value: 'amber-accent-4', color: '#FFAB00' },

  // Orange
  { title: 'Orange', value: 'orange', color: '#FF9800' },
  { title: 'Orange Lighten 5', value: 'orange-lighten-5', color: '#FFF3E0' },
  { title: 'Orange Lighten 4', value: 'orange-lighten-4', color: '#FFE0B2' },
  { title: 'Orange Lighten 3', value: 'orange-lighten-3', color: '#FFCC80' },
  { title: 'Orange Lighten 2', value: 'orange-lighten-2', color: '#FFB74D' },
  { title: 'Orange Lighten 1', value: 'orange-lighten-1', color: '#FFA726' },
  { title: 'Orange Darken 1', value: 'orange-darken-1', color: '#FB8C00' },
  { title: 'Orange Darken 2', value: 'orange-darken-2', color: '#F57C00' },
  { title: 'Orange Darken 3', value: 'orange-darken-3', color: '#EF6C00' },
  { title: 'Orange Darken 4', value: 'orange-darken-4', color: '#E65100' },
  { title: 'Orange Accent 1', value: 'orange-accent-1', color: '#FFD180' },
  { title: 'Orange Accent 2', value: 'orange-accent-2', color: '#FFAB40' },
  { title: 'Orange Accent 3', value: 'orange-accent-3', color: '#FF9100' },
  { title: 'Orange Accent 4', value: 'orange-accent-4', color: '#FF6D00' },

  // Deep Orange
  { title: 'Deep Orange', value: 'deep-orange', color: '#FF5722' },
  { title: 'Deep Orange Lighten 5', value: 'deep-orange-lighten-5', color: '#FBE9E7' },
  { title: 'Deep Orange Lighten 4', value: 'deep-orange-lighten-4', color: '#FFCCBC' },
  { title: 'Deep Orange Lighten 3', value: 'deep-orange-lighten-3', color: '#FFAB91' },
  { title: 'Deep Orange Lighten 2', value: 'deep-orange-lighten-2', color: '#FF8A65' },
  { title: 'Deep Orange Lighten 1', value: 'deep-orange-lighten-1', color: '#FF7043' },
  { title: 'Deep Orange Darken 1', value: 'deep-orange-darken-1', color: '#F4511E' },
  { title: 'Deep Orange Darken 2', value: 'deep-orange-darken-2', color: '#E64A19' },
  { title: 'Deep Orange Darken 3', value: 'deep-orange-darken-3', color: '#D84315' },
  { title: 'Deep Orange Darken 4', value: 'deep-orange-darken-4', color: '#BF360C' },
  { title: 'Deep Orange Accent 1', value: 'deep-orange-accent-1', color: '#FF9E80' },
  { title: 'Deep Orange Accent 2', value: 'deep-orange-accent-2', color: '#FF6E40' },
  { title: 'Deep Orange Accent 3', value: 'deep-orange-accent-3', color: '#FF3D00' },
  { title: 'Deep Orange Accent 4', value: 'deep-orange-accent-4', color: '#DD2C00' },

  // Brown
  { title: 'Brown', value: 'brown', color: '#795548' },
  { title: 'Brown Lighten 5', value: 'brown-lighten-5', color: '#EFEBE9' },
  { title: 'Brown Lighten 4', value: 'brown-lighten-4', color: '#D7CCC8' },
  { title: 'Brown Lighten 3', value: 'brown-lighten-3', color: '#BCAAA4' },
  { title: 'Brown Lighten 2', value: 'brown-lighten-2', color: '#A1887F' },
  { title: 'Brown Lighten 1', value: 'brown-lighten-1', color: '#8D6E63' },
  { title: 'Brown Darken 1', value: 'brown-darken-1', color: '#6D4C41' },
  { title: 'Brown Darken 2', value: 'brown-darken-2', color: '#5D4037' },
  { title: 'Brown Darken 3', value: 'brown-darken-3', color: '#4E342E' },
  { title: 'Brown Darken 4', value: 'brown-darken-4', color: '#3E2723' },

  // Blue Grey
  { title: 'Blue Grey', value: 'blue-grey', color: '#607D8B' },
  { title: 'Blue Grey Lighten 5', value: 'blue-grey-lighten-5', color: '#ECEFF1' },
  { title: 'Blue Grey Lighten 4', value: 'blue-grey-lighten-4', color: '#CFD8DC' },
  { title: 'Blue Grey Lighten 3', value: 'blue-grey-lighten-3', color: '#B0BEC5' },
  { title: 'Blue Grey Lighten 2', value: 'blue-grey-lighten-2', color: '#90A4AE' },
  { title: 'Blue Grey Lighten 1', value: 'blue-grey-lighten-1', color: '#78909C' },
  { title: 'Blue Grey Darken 1', value: 'blue-grey-darken-1', color: '#546E7A' },
  { title: 'Blue Grey Darken 2', value: 'blue-grey-darken-2', color: '#455A64' },
  { title: 'Blue Grey Darken 3', value: 'blue-grey-darken-3', color: '#37474F' },
  { title: 'Blue Grey Darken 4', value: 'blue-grey-darken-4', color: '#263238' },

  // Grey
  { title: 'Grey', value: 'grey', color: '#9E9E9E' },
  { title: 'Grey Lighten 5', value: 'grey-lighten-5', color: '#FAFAFA' },
  { title: 'Grey Lighten 4', value: 'grey-lighten-4', color: '#F5F5F5' },
  { title: 'Grey Lighten 3', value: 'grey-lighten-3', color: '#EEEEEE' },
  { title: 'Grey Lighten 2', value: 'grey-lighten-2', color: '#E0E0E0' },
  { title: 'Grey Lighten 1', value: 'grey-lighten-1', color: '#BDBDBD' },
  { title: 'Grey Darken 1', value: 'grey-darken-1', color: '#757575' },
  { title: 'Grey Darken 2', value: 'grey-darken-2', color: '#616161' },
  { title: 'Grey Darken 3', value: 'grey-darken-3', color: '#424242' },
  { title: 'Grey Darken 4', value: 'grey-darken-4', color: '#212121' },

  // Black & White
  { title: 'Black', value: 'black', color: '#000000' },
  { title: 'White', value: 'white', color: '#FFFFFF' },
])

</script>

<template>
  <v-select
      v-model="model"
      :label="label"
      :items="colors"
      item-title="title"
      item-value="value"
      :variant="variant"
      :density="density"
      :clearable="clearable"
      :readonly="readonly"
      :hide-details="hideDetails"
      :error-messages="errorMessages"
      :rules="rules"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props">
        <template v-slot:prepend>
          <v-avatar :color="item.raw.color" size="24"></v-avatar>
        </template>
      </v-list-item>
    </template>
    <template v-slot:selection="{ item }">
      <v-chip :color="item.raw.color" size="small">
        {{ item.raw.title }}
      </v-chip>
    </template>
  </v-select>
</template>

<style scoped>

</style>
