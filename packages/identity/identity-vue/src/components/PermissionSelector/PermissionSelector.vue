<script setup lang="ts">

import {ref, onMounted, defineModel, computed} from 'vue'
import type {PropType} from 'vue'
import {useI18n} from "vue-i18n";
import { useTheme } from 'vuetify'
const {t, te} = useI18n()

defineProps({
  errorMessages: {type: String as PropType<string | string[] | undefined>,},
  readonly: {type: Boolean, default: false},
})

const theme = useTheme()

function hasCustomColor(colorName: string) {
  return colorName in theme.current.value.colors
}

let enableColor = ref(hasCustomColor('enable') ? 'enable' : 'green-darken-3')


const model = defineModel()
import {useRole} from "../../composables/useRole";

const {fetchPermissions} = useRole()
let items = ref([])
let loading = ref(false)

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

onMounted(async () => {
  loading.value = true
  await sleep(1000) // simulate network delay
  items.value = await fetchPermissions()
  loading.value = false
})

interface PermissionGroups {
  [key: string]: string[];
}

const permissionGroups = computed(() => {
  const groups = items.value.reduce((acc: PermissionGroups, permission: string) => {
    if (permission.includes(':')) {
      const [entity] = permission.split(':');
      if (!acc[entity]) {
        acc[entity] = [];
      }
      acc[entity].push(permission);
    } else {
      const generalGroup = 'general';
      if (!acc[generalGroup]) {
        acc[generalGroup] = [];
      }
      acc[generalGroup].push(permission);
    }
    return acc;
  }, {});

  return groups;
})


</script>

<template>
  <v-sheet class="pa-2">
    <h5 class="text-h5 mb-2">{{ te('permission.permissions') ? t('permission.permissions') : 'Permissions' }}</h5>
    <v-skeleton-loader
        :loading="loading"
        height="340"
        type="list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line"
    >

      <v-item-group
          v-model="model"
          variant="outlined"
          divided
          multiple
          color="green"
      >
        <template v-for="(permissions, entity) in permissionGroups" :key="entity">
          <v-card class="mb-2" variant="outlined">
            <v-card-title class="text-capitalize">
              {{ t ? t('permission.' + entity) : entity }}
            </v-card-title>
            <v-card-text>
              <v-item
                  v-for="permission in permissions"
                  v-slot="{ isSelected, toggle }"
                  :value="permission" :disabled="readonly"
              >

                <v-btn
                    :color="isSelected? enableColor : 'grey-darken-3'" :readonly="readonly"
                    @click="toggle" variant="flat" :rounded="false" border
                >
                  {{ te('permission.' + permission) ? t('permission.' + permission) : permission }}
                </v-btn>
              </v-item>
            </v-card-text>
          </v-card>
        </template>
      </v-item-group>

    </v-skeleton-loader>
  </v-sheet>
</template>

<style scoped>

</style>
