<script setup lang="ts">

import {PropType, defineModel} from "vue";
import {IEntityForm} from "@/generator/interfaces/IEntityForm";
import { IClientInputError } from "@drax/common-front";

const model = defineModel({})

defineProps({
  entity:{
    type:Object as PropType<IEntityForm>,
    required:true
  },
  inputErrors:{
    type:Object as PropType<IClientInputError>,
    required:true
  },
  variant: {
    type:String as PropType<"underlined" | "filled" | "outlined" | "plain" | "solo" | "solo-inverted" | "solo-filled">,
    required:false,
    default:''
  }
})
</script>

<template>

  <form>

    <template v-for="field in entity.fields" :key="field.name">
      sad
      <v-text-field

        v-if="field.type === 'text'"
        :variant="variant"
        :label="field.label"
        v-model="model[field.name]"
        type="text"
        :required="field.required"
        :readonly="field.readonly"
        :error-messages="inputErrors[field.name]"
      ></v-text-field>

      {{field}}
    </template>

  </form>

</template>

<style scoped>

</style>
