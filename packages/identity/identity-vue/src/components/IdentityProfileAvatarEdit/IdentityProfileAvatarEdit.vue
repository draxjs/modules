<script setup lang="ts">
import {ref} from 'vue'
import {useAuth} from "../../composables/useAuth";
import IdentityProfileAvatar from "../IdentityProfileAvatar/IdentityProfileAvatar.vue";

const {changeAvatar} = useAuth();

let fileInput = ref()
let showEdit = ref(false)


function onAvatarClick() {
  fileInput.value.click();
}

async function onFileChanged(e: Event) {
  if (e.target && (e.target as HTMLInputElement).files) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      await changeAvatar(files[0]);
    }
  }
}

defineProps({
  avatarSize: {
    type: Number,
    default: 54
  }
})

</script>

<template>
  <div @mouseenter="showEdit = true" @mouseleave="showEdit= false" >
    <identity-profile-avatar
        :avatar-size="avatarSize"
        @click="onAvatarClick"
    >
      <v-icon  v-if="showEdit" size="35" color="white" class="mdi mdi-pencil bg-black rounded"></v-icon>
    </identity-profile-avatar>
    <input
        accept="image/png, image/jpeg, image/jpg"
        ref="fileInput"
        class="d-none"
        type="file"
        @change="onFileChanged"
    >
  </div>
</template>

<style scoped>
.v-avatar {
  cursor: pointer;
  transition: all .4s ease-in-out;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.v-avatar:hover {
  filter: brightness(80%);
}


</style>
