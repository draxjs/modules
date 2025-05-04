
<script setup lang="ts">
import LanguageCrud from '../../cruds/LanguageCrud'
import {Crud, useCrudStore, CrudFormField} from "@drax/crud-vue";
const store = useCrudStore()
</script>

<template>
  <crud :entity="LanguageCrud.instance">
    <template v-slot:item.icon="{value}"><v-img :src="value?.url" max-height="30px" class="my-1" /></template>

    <template v-slot:field.name>
      <crud-form-field
        :entity="LanguageCrud.instance"
        :field="{name: 'resume', label: 'Curriculum', type: 'file', default: '' }"
        v-model="store.form.resume"
      ></crud-form-field>
    </template>
  </crud>
</template>

<style scoped>

</style>

