<script setup lang="ts">
import CountryCrud from '../../cruds/CountryCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="CountryCrud.instance">
    <template v-slot:item.flag="{value}">
      <v-img :src="value" max-height="30px" class="my-1"/>
    </template>
    <template v-slot:item.tenant="{value}">{{ value?.name }}</template>
    <template v-slot:item.createdBy="{value}">{{ value?.username }}</template>



    <template v-slot:field.name="{field, form}">
      <v-text-field
        v-model="form[field.name]"
        label="custom name form"
        color="pink"
      ></v-text-field>
    </template>


<!--    <template v-slot:form="{form, operation}">-->
<!--    THE FORM {{form}} {{operation}}-->
<!--    </template>-->

  </crud>
</template>

<style scoped>

</style>

