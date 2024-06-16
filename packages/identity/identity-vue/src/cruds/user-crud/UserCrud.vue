<script setup lang="ts">
import {ref} from 'vue'
import UserList from "./UserList.vue";
import UserForm from "../../forms/UserForm.vue";

let dialog = ref(false);
let dialogTitle = ref('');

function add(){
  dialog.value = true;
  dialogTitle.value = 'Agregar Usuario';
}

function save(){
  dialog.value = false;
}

</script>

<template>
<v-container>
  <v-sheet border rounded>
    <v-toolbar>
      <v-toolbar-title>Administración de Usuarios</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="add">Agregar</v-btn>
    </v-toolbar>
    <v-theme-provider with-background class="pa-2 rounded-b" >
        <UserList />
    </v-theme-provider>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="800">
    <v-sheet border>
      <v-toolbar>
        <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
      </v-toolbar>
      <v-card class="pa-10">
        <v-card-text>
          <UserForm></UserForm>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="save">Guardar</v-btn>
        </v-card-actions>

      </v-card>
    </v-sheet>
  </v-dialog>

</v-container>
</template>

<style scoped>

</style>
