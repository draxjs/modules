<script setup lang="ts">
import { onMounted } from 'vue';

  const props = withDefaults(defineProps<{loading: boolean, color: string, data: {user: string, actions: number}[]}>(), {
    loading: false,
    color: 'green',
    data: () => []
  })

  const maxValue = Math.max(...props.data.map(item => item.actions));
  
  const valuesX = Array.from({ length: props.data.length + 1 }, (_, i) => Math.round((maxValue / props.data.length) * i));
  valuesX.sort((a, b) => a - b);

  const userSorted = [...props.data].sort((a, b) => b.actions - a.actions);
  const calcWidthPerUser = (user: { actions: number }): string => {
    return `calc(${(user.actions / maxValue)} * (100% - 140px))`;
  };

  function showTooltip(e: MouseEvent, text: string) {
    const element = document.getElementById('activity-tooltip')
    if (element) {
      element.innerText = text
      element.style.display = 'block'
    }
  }

  function hideTooltip() {
    const element = document.getElementById('activity-tooltip')
    if (element) element.style.display = 'none'
  }

  function moveTooltip(e: MouseEvent) {
    const element = document.getElementById('activity-tooltip')
    if (element) {
      element.style.left = `${e.clientX + 10}px`
      element.style.top = `${e.clientY + 10}px`
    }
  }

  onMounted(() => {
    const tooltip = document.getElementById('activity-tooltip')
    if (tooltip) document.body.appendChild(tooltip)
  })
</script>

<template>
  <div id="activity-tooltip" style="
    position: fixed;
    background: black;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    display: none;
    pointer-events: none;
  "></div>
  <v-card class="my-4 pb-2" width="100%" height="400" variant="text">
    <template v-if="props.loading">
      <v-card width="100%" height="100%" variant="text" class="d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </v-card>
    </template>
    <template v-else>
      <div style="position: absolute; top: 0; left: 10px; height: 100%; width: 100%;" class="d-flex flex-column justify-space-around">
        <div v-for="user of userSorted" class="d-flex align-center" style="width: 100%;">
          <span class="text-caption" style="max-width: 120px; text-wrap-mode: break-word; white-space: wrap; text-wrap: wrap;">{{ user.user }}</span>
        </div>
      </div>
      <div style="position: absolute; top: 0; left: 140px; height: 100%; width: 100%;" class="d-flex flex-column justify-space-around">
        <v-card 
          v-for="user of userSorted" class="d-flex align-center" :style="{width: '100%', height: `${100 / userSorted.length}%`}"
          variant="text"
          color="blue"
          @click=""
          @mouseover="showTooltip($event, `${user.user}: ${user.actions}`)"
          @mouseout="hideTooltip()"
          @mousemove="moveTooltip($event)"
        >
          <v-divider></v-divider>
          <v-card 
            :style="{width: calcWidthPerUser(user), height: '20px', position: 'absolute'}" :color="props.color"
          ></v-card>
        </v-card>
      </div>
      <div style="position: absolute; top: 380px; bottom: 0; left: 140px; height: 100%; width: calc(100% - 140px);">
        <div class="d-flex align-center justify-space-between">
          <span v-for="value of valuesX"  class="text-caption">{{ value }}</span>
        </div>
      </div>
    </template>
  </v-card>
</template>