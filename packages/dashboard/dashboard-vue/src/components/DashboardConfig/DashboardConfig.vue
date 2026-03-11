<script setup lang="ts">
import {ref} from "vue";
import type {IDashboardBase, IDashboardCard} from "@drax/dashboard-share";
import GroupByCard from "../GroupByCard/GroupByCard.vue";
import PaginateCard from "../PaginateCard/PaginateCard.vue";
import DashboardCardEditor from "./DashboardCardEditor.vue";
import {debounce} from "@drax/common-front"

const valueModel = defineModel<IDashboardBase>({required: true})

const editingCardIndex = ref<number | null>(null);

// Drag and drop state
const dragCardIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

const onDragStart = (e: DragEvent, index: number) => {
  dragCardIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
};

const onDragEnter = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (dragCardIndex.value !== index) {
    dropTargetIndex.value = index;
  }
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = (e: DragEvent, index: number) => {
  e.preventDefault();
  dropTargetIndex.value = null;
  if (dragCardIndex.value !== null && dragCardIndex.value !== index) {
    const cards = valueModel.value.cards || [];
    const movedItem = cards.splice(dragCardIndex.value, 1)[0] as IDashboardCard;
    cards.splice(index, 0, movedItem);
    emit("dashboardUpdated")
  }
  dragCardIndex.value = null;
};

const onDragEnd = () => {
  dragCardIndex.value = null;
  dropTargetIndex.value = null;
};

// Actions
const editCard = (index: number) => {
  editingCardIndex.value = index;
};

const deleteCard = (index: number) => {
  if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
    valueModel.value.cards?.splice(index, 1);
    if (editingCardIndex.value === index) {
      editingCardIndex.value = null;
    }
    emit("dashboardUpdated")
  }
};

const contractCard = (index: number) => {
  const card = valueModel.value.cards?.[index];
  if (card && card.layout) {
    card.layout.md = Math.max(3, (card.layout.md || 12) - 1);
    card.layout.lg = Math.max(3, (card.layout.lg || 12) - 1);
    emit("dashboardUpdated")
  }
};

const expandCard = (index: number) => {
  const card = valueModel.value.cards?.[index];
  if (card && card.layout) {
    card.layout.md = Math.min(12, (card.layout.md || 12) + 1);
    card.layout.lg = Math.min(12, (card.layout.lg || 12) + 1);
    emit("dashboardUpdated")
  }
};

const addNewCard = () => {
  if (!valueModel.value.cards) {
    valueModel.value.cards = [];
  }
  valueModel.value.cards.push({
    title: 'Nueva Tarjeta',
    entity: '',
    filters: [],
    type: 'groupBy',
    layout: {cols: 12, sm: 12, md: 6, lg: 6, height: 450, cardVariant: 'elevated'}
  });
  editingCardIndex.value = valueModel.value.cards.length - 1;
};



const onSaveCard = () => {
  emit("dashboardUpdated")
  editingCardIndex.value = null;
};

const debouncedSave = debounce(onSaveCard, 500)

const onCancelCard = () => {
  editingCardIndex.value = null;
};

const emit = defineEmits(["dashboardUpdated"])

</script>

<template>
  <v-card v-if="valueModel" class="mt-3 valueModel-config-wrapper" variant="flat" >
    <v-card-title class="px-0 d-flex align-center">
        <v-text-field
            variant="solo-filled"
            class="font-weight-semibold"
            v-model="valueModel.title"
            @update:modelValue="debouncedSave"
        ></v-text-field>
      <v-spacer></v-spacer>
      <slot name="buttons"></slot>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="addNewCard" elevation="2">Añadir Tarjeta</v-btn>
    </v-card-title>

    <v-card-text class="px-0">
      <div v-if="!valueModel.cards?.length"
           class="text-center pa-10 text-grey border-dashed rounded-lg bg-surface mt-4">
        <v-icon icon="mdi-view-valueModel-variant-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
        <h3 class="text-h6">Dashboard Vacío</h3>
        <p class="mb-4">No hay tarjetas configuradas todavía.</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addNewCard">Añadir primera tarjeta
        </v-btn>
      </div>

      <v-row v-else class="mt-2">
        <v-col v-for="(card, i) in valueModel.cards" :key="i"
               :cols="card?.layout?.cols || 12"
               :sm="card?.layout?.sm || 12"
               :md="card?.layout?.md || 12"
               :lg="card?.layout?.lg || 12"
               class="transition-swing drop-zone"
               :class="{ 'drop-target': dropTargetIndex === i }"
               @dragenter="onDragEnter($event, i)"
               @dragover="onDragOver"
               @drop="onDrop($event, i)"
        >
          <!-- Vista Edición -->
          <template v-if="editingCardIndex === i">
            <dashboard-card-editor
                v-if="valueModel.cards[i]"
                v-model="valueModel.cards[i]"
                @save="onSaveCard"
                @cancel="onCancelCard()"
            />
          </template>

          <!-- Vista Card -->
          <v-card v-else
                  :variant="card?.layout?.cardVariant || 'outlined'"
                  :height="card?.layout?.height || 300"
                  class="hover-card d-flex flex-column"
                  draggable="true"
                  @dragstart="onDragStart($event, i)"
                  @dragend="onDragEnd"
          >
            <!-- Toolbar oculta en hover -->
            <div class="card-toolbar d-flex align-center px-2 py-1 bg-grey-lighten-4">
              <v-icon icon="mdi-drag" class="cursor-move text-grey" title="Arrastrar para mover"></v-icon>
              <span class="text-caption text-grey ml-2">{{ card?.layout?.md || 12 }} cols</span>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-arrow-collapse-horizontal" variant="text" size="x-small" density="comfortable"
                     color="grey-darken-1" title="Contraer" @click="contractCard(i)"
                     :disabled="(card?.layout?.md || 12) <= 3"></v-btn>
              <v-btn icon="mdi-arrow-expand-horizontal" variant="text" size="x-small" density="comfortable"
                     color="grey-darken-1" title="Expandir" @click="expandCard(i)"
                     :disabled="(card?.layout?.md || 12) >= 12"></v-btn>
              <v-divider vertical class="mx-1"></v-divider>
              <v-btn icon="mdi-pencil" variant="text" size="x-small" density="comfortable" color="primary"
                     title="Editar" @click="editCard(i)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="x-small" density="comfortable" color="error"
                     title="Eliminar" @click="deleteCard(i)"></v-btn>
            </div>

            <v-card-title class="text-subtitle-1 font-weight-bold pb-1">{{ card?.title }}</v-card-title>
            <v-card-text class="flex-grow-1 overflow-y-auto pt-0 relative">
              <paginate-card v-if="card?.type === 'paginate'" :card="card"/>
              <group-by-card v-else-if="card?.type === 'groupBy'" :card="card"/>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.hover-card:hover {
  box-shadow: 0 8px 17px 2px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.0);
}

.card-toolbar {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.hover-card:hover .card-toolbar {
  opacity: 1;
}

.cursor-move {
  cursor: grab;
}

.cursor-move:active {
  cursor: grabbing;
}

.border-dashed {
  border: 2px dashed rgba(0, 0, 0, 0.12);
}

.drop-zone {
  transition: padding 0.2s ease-in-out;
}

.drop-target {
  padding-left: 20px;
  position: relative;
}

.drop-target::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 12px;
  bottom: 12px;
  width: 4px;
  border-radius: 4px;
}
</style>
