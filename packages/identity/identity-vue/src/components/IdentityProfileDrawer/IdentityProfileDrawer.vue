<script setup lang="ts">
import {useAuth} from "../../composables/useAuth";
import {defineModel} from "vue";
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import { useDisplay } from 'vuetify'

const {t} = useI18n()
const router = useRouter()

const {mobile} = useDisplay()
const auth = useAuth()
const valueModel = defineModel<boolean>()


</script>

<template>
  <v-navigation-drawer
      v-model="valueModel"
      :location="mobile ? 'top' : 'right'"
  >

    <template v-if="auth.isAuthenticated()">
      <identity-profile-view></identity-profile-view>
      <v-divider></v-divider>
      <v-list>

        <slot name="menu"></slot>

        <v-list-item
            @click="router.push({name:'Profile'})"
            prepend-icon="mdi-account-cog"
            :title="t('user.profile')"
        >
        </v-list-item>

        <v-list-item
            v-if="auth.hasPermission('userApiKey:manage')"
            @click="router.push({name:'CrudUserApiKey'})"
            prepend-icon="mdi-table-key"
            :title="t('userapikey.menu')"
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
