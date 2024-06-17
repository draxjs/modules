<script setup lang="ts">
import {ref} from 'vue'
import UserList from "./UserList.vue";
import UserForm from "../../forms/UserForm.vue";
import {useUser} from "../../composables/useUser";
import type {IUser} from "@drax/identity-front";

const {createUser, userError, inputErrors} = useUser()

let dialog = ref(false);
let dialogTitle = ref('');
const list = ref(null);

function add(){
  dialog.value = true;
  dialogTitle.value = 'Agregar Usuario';
}

let form = ref<IUser>({name: "", username: "", password: "", email: "", phone: "", role: "", active: true})

function save(){
  //dialog.value = false;
  createUser(form.value);
  list.value.loadItems()
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
        <UserList ref="list" />
    </v-theme-provider>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="800">
    <v-sheet border>
      <v-toolbar>
        <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
      </v-toolbar>
      <v-card class="pa-10">
        <v-card-text>
          <UserForm v-model="form" :inputErrors="inputErrors"></UserForm>
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
