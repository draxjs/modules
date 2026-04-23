<script setup lang="ts">
import {useI18n} from "vue-i18n";
import PasswordPolicySummary from "../components/PasswordPolicy/PasswordPolicySummary.vue";

const {t} = useI18n()
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="8" lg="6">
        <v-card variant="elevated">
          <v-card-title class="pa-4">
            {{ t('user.passwordPolicy.title') }}
          </v-card-title>
          <v-card-text>
            <PasswordPolicySummary variant="full" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
