<script setup lang="ts">

import {IdentityLogin} from "@drax/identity-vue";
import {useDisplay, useTheme} from 'vuetify'
import {computed} from 'vue'
import {useRouter} from "vue-router";
import GoogleLogin from "@/modules/base/components/GoogleLogin.vue";


const router = useRouter()


const {mobile} = useDisplay()
const theme = useTheme()
const primaryColor = computed(() => theme.current.value.colors.primary)
const primaryColorText = computed(() => theme.current.value.colors.background)

const TITLE_MAIN = import.meta.env.VITE_TITLE_MAIN || 'DRAX';
const TITLE_SEC = import.meta.env.VITE_TITLE_SEC || 'SCAFFOLD';


function onLoginSuccess(){
  router.push('/')
}

</script>

<template>
  <v-container fluid class="fill-height">

    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <h2 class="pb-10 text-center default-cursor" :class="mobile ? 'text-h4' : 'text-h2'">
          <span class="pa-3 font-weight-medium rounded logo">{{ TITLE_MAIN }}</span> {{ TITLE_SEC }}
        </h2>

        <IdentityLogin @loginSuccess="onLoginSuccess" recovery register></IdentityLogin>

        <div class="d-flex justify-center mt-4 mb-2">
          <google-login @loginSuccess="onLoginSuccess"></google-login>
        </div>

        <div class="d-flex justify-center">
          <dark-mode></dark-mode>
        </div>
      </v-col>

    </v-row>

  </v-container>
</template>

<style scoped>
.logo {
  background-color: v-bind(primaryColor);
  color: v-bind(primaryColorText) !important;
}

</style>

