<script setup lang="ts">
import {useAuth} from "../../composables/useAuth";
import {defineModel, ref} from "vue";
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";
import IdentityChangeOwnPassword from "../../components/IdentityChangeOwnPassword/IdentityChangeOwnPassword.vue";

const auth = useAuth()
const valueModel = defineModel()
const profile = ref(false)
const changePassword = ref(false)


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
            @click="profile = !profile"
            prepend-icon="mdi-account-cog"
            :title="$t('user.profile')"
        >
        </v-list-item>
        <v-list-item
            @click="auth.logout()"
            prepend-icon="mdi-logout"
            :title="$t('user.logout')"
        >
        </v-list-item>
      </v-list>
    </template>

    <template v-else>
      <v-list>
        <v-list-item
            href="/login"
            prepend-icon="mdi-login"
            :title="$t('user.login')"
        >
        </v-list-item>
      </v-list>
    </template>

    <v-dialog v-model="profile"  fullscreen :on-after-leave="changePassword=false">
      <v-toolbar>
        <v-toolbar-title>
          {{$t('user.profile')}}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="profile = !profile">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card >
        <v-card-text class="flex-shrink-1 flex-grow-0">
          <identity-profile-view></identity-profile-view>
        </v-card-text>
        <v-card-text class="text-center flex-grow-1">
          <IdentityChangeOwnPassword v-if="changePassword"></IdentityChangeOwnPassword>
          <v-btn v-else  color="blue" variant="tonal" @click="changePassword = true">{{$t('user.changeOwnPassword')}}</v-btn>

        </v-card-text>
      </v-card>
    </v-dialog>

  </v-navigation-drawer>

</template>

<style scoped>

</style>
