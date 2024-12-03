<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {useAuth} from "@drax/identity-vue"

const auth = useAuth()
if (auth.isAuthenticated()) {
  auth.fetchAuthUser()
}else{
  console.log("not authenticated")
}

</script>
