<script setup lang="ts">
import {useAuth} from "../../composables/useAuth";
import {defineModel} from "vue";
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const router = useRouter()


const auth = useAuth()
const valueModel = defineModel<boolean>()


</script>

<template>


  <v-navigation-drawer
      v-model="valueModel"
      location="right"
  >

    <template v-if="auth.isAuthenticated()">
      <identity-profile-view></identity-profile-view>
      <v-divider></v-divider>

      <v-list>
        <v-list-item
            @click="router.push({name:'Profile'})"
            prepend-icon="mdi-account-cog"
            :title="t('user.profile')"
        >
        </v-list-item>
        <v-list-item
            @click="auth.logout()"
            prepend-icon="mdi-logout"
            :title="t('user.action.logout')"
        >
        </v-list-item>
      </v-list>
    </template>

    <template v-else>
      <v-list>
        <v-list-item
            href="/login"
            prepend-icon="mdi-login"
            :title="t('user.action.login')"
        >
        </v-list-item>
      </v-list>
    </template>


  </v-navigation-drawer>

</template>

<style scoped>

</style>
