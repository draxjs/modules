<script setup lang="ts">
import {computed, type PropType} from "vue";
import CrudFormField from "./CrudFormField.vue";
import type {IEntityCrud, IEntityCrudFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {useFilterIcon} from "../composables/useFilterIcon";

const {t} = useI18n()
const valueModel = defineModel({type: [Object]})
const {hasPermission} = useAuth()
const {filterIcon} = useFilterIcon()

const {entity, actionButtons} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  actionButtons: {type: Boolean, default: false},
})

const aFields = computed(() => {
  return entity.filters.filter((field:IEntityCrudFilter) => !field.permission || hasPermission(field.permission))
})

function filter() {
  emit('applyFilter')
}

function clear() {
  emit('clearFilter')
}

function onUpdateValue(){
  if(!actionButtons){
    emit('applyFilter')
  }
}

const emit = defineEmits(['applyFilter', 'clearFilter'])

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

            <slot :name="`filter.${filter.name}`" v-bind="{filter, filterIndex: index}">
              <crud-form-field
                  :field="filter"
                  :entity="entity"
                  v-model="valueModel[index].value"
                  :clearable="true"
                  density="compact"
                  variant="outlined"
                  :prepend-inner-icon="filterIcon(filter)"
                  hide-details  disable-rules
                  @updateValue="onUpdateValue"
              />
            </slot>

          </v-col>

        </v-row>

    <v-card-actions v-if="actionButtons" class="pb-0">
      <v-spacer />
      <v-btn  variant="text" density="compact" :class="entity.cleanFilterClass" @click="clear">{{ t('action.clear') }}</v-btn>
      <v-btn variant="flat" density="compact" :class="entity.applyFilterClass"  @click="filter">
        {{ t('action.filter') }}
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<style scoped>

</style>
