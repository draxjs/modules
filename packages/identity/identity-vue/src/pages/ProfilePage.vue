<script setup lang="ts">
import IdentityProfileView from "../components/IdentityProfileView/IdentityProfileView.vue";
import {useRouter} from "vue-router";
import IdentityProfileAvatarChanger from "@/components/IdentityProfileAvatarEdit/IdentityProfileAvatarEdit.vue";
const router = useRouter();

</script>

<template>
  <v-container fluid class="fill-height">

    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">

        <v-card>
          <identity-profile-view> </identity-profile-view>
          <v-card-text class="text-center">
            <v-btn color="blue" variant="tonal" @click="router.push({name: 'Password'})">{{$t('user.changeOwnPassword')}}</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>

</style>

