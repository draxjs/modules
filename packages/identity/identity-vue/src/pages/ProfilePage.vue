<script setup lang="ts">
import IdentityProfileView from "../components/IdentityProfileView/IdentityProfileView.vue";
import {useRouter} from "vue-router";
const router = useRouter();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <v-container fluid class="fill-height">

    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">

        <v-card>
          <identity-profile-view> </identity-profile-view>
          <v-card-text class="text-center">
            <v-btn color="blue" variant="tonal" @click="router.push({name: 'PasswordChange'})">
              {{t('user.action.changeOwnPassword')}}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>

</style>

