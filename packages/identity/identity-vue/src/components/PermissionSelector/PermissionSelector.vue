<script setup lang="ts">

import {ref, onMounted, defineModel, computed} from 'vue'
import type {PropType} from 'vue'

const props = defineProps({
  errorMessages: {
    type: String as PropType<string | string[] | undefined>,
  }
})

const model = defineModel()
import {useRole} from "../../composables/useRole";

const {fetchPermissions} = useRole()
let items = ref([])

onMounted(async () => {
  items.value = await fetchPermissions()
})

interface PermissionGroups {
  [key: string]: string[];
}

const permissionGroups = computed(() => {
  const groups = items.value.reduce((acc: PermissionGroups, permission: string) => {
    if (permission.includes(':')) {
      const [entity, action] = permission.split(':');
      if (!acc[entity]) {
        acc[entity] = [];
      }
      acc[entity].push(permission);
    } else {
      // Si el permiso no sigue el formato entidad:acción, lo asignamos al grupo 'general'
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
  <v-sheet  class="pa-2">
    <h5 class="text-h5 mb-2">{{$t ? $t('permission.permissions') : 'Permissions'}}</h5>
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
          {{ $t ? $t('permission.'+entity) : entity }}
        </v-card-title>
        <v-card-text>
          <v-item
              v-for="permission in permissions"
              v-slot="{ isSelected, toggle }"
              :value="permission"
          >
            <v-btn
                :color="isSelected? 'green' : 'grey-darken-3'" class=""
                @click="toggle" variant="flat" :rounded="false" border
            >
              {{ $t ? $t('permission.'+permission) : permission }}
            </v-btn>
          </v-item>
        </v-card-text>
      </v-card>
    </template>
  </v-item-group>

  </v-sheet>
</template>

<style scoped>

</style>
