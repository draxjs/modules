<script setup lang="ts">
import type {PropType} from "vue";
import {ref} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const valueModel = defineModel({type: [Object]})


const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  actions: {type: Boolean, default: false},
})


async function filter() {
  emit('filter')
}

async function clear() {
  emit('filter')
}


const emit = defineEmits(['filter', 'clear','updateValue'])

</script>

<template>
  <v-card flat >
        <v-row dense class="mt-1" justify="space-between">
          <v-col v-for="(filter,index) in entity.filters" :key="filter.name"
                 cols="12" sm="6" md="4"
          >
            <crud-form-field
                :field="filter"
                :entity="entity"
                v-model="valueModel[index].value"
                :clearable="true"
                density="compact"
                variant="outlined"
                hide-details single-line disable-rules
                @updateValue="$emit('updateValue')"
            />
          </v-col>

        </v-row>

    <v-card-actions v-if="actions" class="pb-0">
      <v-spacer />
      <v-btn variant="text" density="compact" color="grey" @click="clear">{{ t('action.clear') }}</v-btn>
      <v-btn variant="flat" density="compact" color="primary" @click="filter">
        {{ t('action.filter') }}
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<style scoped>

</style>
