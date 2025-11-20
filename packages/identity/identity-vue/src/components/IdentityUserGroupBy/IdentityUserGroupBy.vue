<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserSystemFactory } from '@drax/identity-front'

interface RoleGroup {
  _id: string
  count: number
  name?: string
  icon?: string
  color?: string
}

const userSystem = UserSystemFactory.getInstance()
const roleGroups = ref<RoleGroup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadUsersByRole = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await userSystem.groupBy({fields: ['role']})
    roleGroups.value = result.map((group: any) => ({
      _id: group._id,
      count: group.count,
      name: group?.role?.name || 'Sin rol',
      icon: group?.role?.icon || 'mdi-account-group',
      color: group?.role?.color || 'primary'
    }))
  } catch (e) {
    console.error('Error loading users by role:', e)
    error.value = 'Error al cargar los datos de usuarios'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsersByRole()
})
</script>

<template>
  <v-card variant="text" class="rounded-xl ma-4">
    <v-card-text class="pa-2">
      <v-row v-if="loading" justify="center">
        <v-col cols="12" class="text-center py-4">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          ></v-progress-circular>
          <p class="text-body-2 mt-2">Cargando...</p>
        </v-col>
      </v-row>

      <v-row v-else-if="error" justify="center">
        <v-col cols="12" md="6" class="py-2">
          <v-alert
            type="error"
            variant="tonal"
            density="compact"
            closable
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>
          <div class="text-center mt-2">
            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              @click="loadUsersByRole"
            >
              Reintentar
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row v-else dense>
        <v-col
          v-for="group in roleGroups"
          :key="group._id"
          cols="6"
          sm="3"
          md="3"
          lg="2"
        >
          <v-card
            elevation="1"
            hover
            class="role-card"
            :class="`role-card--${group.color}`"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon
                  :color="group.color"
                  size="28"
                  class="mr-2"
                >
                  {{ group.icon }}
                </v-icon>
                <div :class="`text-subtitle-1 font-weight-bold text-truncate text-${group.color}`" :title="group.name">
                  {{ group.name }}
                </div>
              </div>
              <div class="text-center">
                <div :class="`text-h4 font-weight-bold ${group.color}--text`">
                  {{ group.count }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.role-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
}
</style>
