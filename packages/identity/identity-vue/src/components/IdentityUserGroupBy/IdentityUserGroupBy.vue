<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserSystemFactory } from '@drax/identity-front'

interface RoleGroup {
  _id: string
  count: number
  name?: string
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
      name: group?.role?.name || 'Sin rol'
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
    <v-card-title>Usuarios por Rol</v-card-title>
    <v-card-text>


    <v-row v-if="loading" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="text-body-1 mt-4">Cargando datos...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error" justify="center">
      <v-col cols="12" md="6">
        <v-alert
          type="error"
          variant="tonal"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>
        <div class="text-center mt-4">
          <v-btn
            color="primary"
            variant="elevated"
            @click="loadUsersByRole"
          >
            Reintentar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="group in roleGroups"
        :key="group._id"
        cols="12"
        sm="4"
        md="3"
        lg="3"
      >
        <v-card
          elevation="2"
          hover
          class="h-100"
        >
          <v-card-title class="bg-gradient-primary white--text">
            <div class="text-center w-100">
              {{ group.name }}
            </div>
          </v-card-title>

          <v-card-text class="text-center py-2">
            <div class="text-h3 font-weight-bold primary--text mb-2">
              {{ group.count }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #764ba2 100%);
  color: white !important;
}

.h-100 {
  height: 100%;
}

.w-100 {
  width: 100%;
}
</style>
