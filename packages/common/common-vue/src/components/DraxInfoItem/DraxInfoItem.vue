<script setup lang="ts">
import type {PropType} from "vue";

defineProps({
  icon: {type: String as PropType<string>},
  label: {type: String as PropType<string>},
  labelClass: {type: String as PropType<string>, default: 'text-grey-darken-1'},
  value: {type: [String, Number] as PropType<string | number>},
  iconColor: {type: String as PropType<string>},
  fullWidth: {type: String as PropType<string>}
})
</script>

<template>
  <div>
    <v-card variant="tonal" class="mx-auto" rounded="lg">

      <template v-slot:prepend>
        <v-icon v-if="icon" size="large" :color="iconColor" :icon="icon"></v-icon>
      </template>

      <template v-slot:title>
        <label :class="labelClass"
               style="font-size:1.1rem"
        >
          {{ label?.toUpperCase() }}
        </label>
      </template>

      <template v-slot:text>
        <slot>
          <label :class=" icon ? 'ml-8' : 'ml-2' "
                 class="font-weight-semibold"
                 style="font-size:1.3rem"
          >
            {{ value }}
          </label>
        </slot>
      </template>

    </v-card>

  </div>
</template>

<style scoped>

</style>
