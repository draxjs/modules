<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";

const {t} = useI18n()
const valueModel = defineModel({type: [Object]})
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  actions: {type: Boolean, default: false},
})

const aFields = computed(() => {
  return entity.filters.filter((field:IEntityCrudFilter) => !field.permission || hasPermission(field.permission))
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
        <v-row dense class="mt-1">
          <v-col v-for="(filter,index) in aFields"
                 :key="filter.name"
                 :cols="filter.cols ? filter.cols : 12"
                 :sm="filter.sm ? filter.sm : 6"
                 :md="filter.md ? filter.md : 6"
                 :lg="filter.lg ? filter.lg : 4"
                 :xl="filter.xl ? filter.xl : 3"
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
