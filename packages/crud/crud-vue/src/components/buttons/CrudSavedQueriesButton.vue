<script setup lang="ts">
import {computed, ref, type PropType} from "vue";
import type {ICrudSavedQuery, IEntityCrud, IEntityCrudFilter, IDraxFieldFilter} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../../stores/UseCrudStore";
import {useCrud} from "../../composables/UseCrud";
import {useCrudColumns} from "../../composables/UseCrudColumns";
import {CrudSavedQueryProvider} from "@drax/crud-front";
import {useAuth, useAuthStore} from "@drax/identity-vue";
import {createCrudFilterValue} from "../../helpers/CrudRangeFilters";

const {t, te} = useI18n();
const {hasPermission} = useAuth();
const authStore = useAuthStore();

const props = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
});

const store = useCrudStore(props.entity.name);
const {doPaginate} = useCrud(props.entity);
const {setVisibleColumns} = useCrudColumns(props.entity);

const menu = ref(false);
const saveDialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const savedQueries = ref<ICrudSavedQuery[]>([]);
const queryToDelete = ref<ICrudSavedQuery | null>(null);
const form = ref({
  name: "",
  shared: false,
});

type UserIdLike = {
  id?: string;
  _id?: string;
};

const title = computed(() => {
  const key = "crud.savedQueries.title";
  return te(key) ? t(key) : "Saved queries";
});

const saveTitle = computed(() => {
  const key = "crud.savedQueries.save";
  return te(key) ? t(key) : "Save query";
});

const noQueriesText = computed(() => {
  const key = "crud.savedQueries.empty";
  return te(key) ? t(key) : "No saved queries";
});

const deleteTitle = computed(() => {
  const key = "crud.savedQueries.delete";
  return te(key) ? t(key) : "Delete saved query";
});

const deleteConfirmText = computed(() => {
  const key = "crud.savedQueries.deleteConfirm";
  return te(key) ? t(key, {name: queryToDelete.value?.name || ""}) : `Delete "${queryToDelete.value?.name || ""}"?`;
});

const canViewSavedQueries = computed(() => hasPermission("crudSavedQuery:view"));
const canCreateSavedQueries = computed(() => hasPermission("crudSavedQuery:create"));
const canDeleteOwnSavedQueries = computed(() => hasPermission("crudSavedQuery:delete"));
const canDeleteAllSavedQueries = computed(() => hasPermission("crudSavedQuery:all") || hasPermission("crudSavedQuery:deleteAll"));

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function entityFilter(): IDraxFieldFilter[] {
  return [{field: "entity", operator: "eq", value: props.entity.name}];
}

function definedDynamicFilters(): IEntityCrudFilter[] {
  return clone(store.dynamicFilters.filter((filter: IEntityCrudFilter) => filter.name));
}

function buildStaticFilters(savedFilters: IDraxFieldFilter[] = []): IDraxFieldFilter[] {
  const savedByField = new Map(savedFilters.map(filter => [filter.field, filter]));

  return props.entity.filters.map(filter => {
    const savedFilter = savedByField.get(filter.name);
    return {
      field: filter.name,
      operator: savedFilter?.operator || filter.operator || "eq",
      value: savedFilter ? savedFilter.value : createCrudFilterValue(filter)
    };
  });
}

function queryUserId(query: ICrudSavedQuery): string | undefined {
  const user = query.user;
  if (!user) {
    return undefined;
  }
  if (typeof user === "string") {
    return user;
  }
  const id = user._id || user.id;
  return id ? String(id) : undefined;
}

function currentUserId(): string | undefined {
  const authUser = authStore.authUser as UserIdLike | null;
  const id = authUser?.id || authUser?._id;
  return id ? String(id) : undefined;
}

function canDeleteQuery(query: ICrudSavedQuery): boolean {
  if (canDeleteAllSavedQueries.value) {
    return true;
  }
  if (!canDeleteOwnSavedQueries.value) {
    return false;
  }

  const ownerId = queryUserId(query);
  return !ownerId || ownerId === currentUserId();
}

async function loadQueries() {
  loading.value = true;
  try {
    savedQueries.value = await CrudSavedQueryProvider.instance.find({
      limit: 100,
      orderBy: "name",
      order: "asc",
      filters: entityFilter()
    });
  } catch (error) {
    console.error("Error loading saved queries", error);
    savedQueries.value = [];
  } finally {
    loading.value = false;
  }
}

function openSaveDialog() {
  form.value = {name: "", shared: false};
  saveDialog.value = true;
}

async function saveQuery() {
  if (!form.value.name.trim()) {
    return;
  }

  saving.value = true;
  try {
    await CrudSavedQueryProvider.instance.create({
      entity: props.entity.name,
      name: form.value.name.trim(),
      shared: form.value.shared,
      columns: clone(store.visibleColumns),
      staticFilters: clone(store.filters),
      dynamicFilters: definedDynamicFilters(),
    });
    saveDialog.value = false;
    await loadQueries();
  } catch (error) {
    console.error("Error saving query", error);
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(query: ICrudSavedQuery) {
  queryToDelete.value = query;
  deleteDialog.value = true;
  menu.value = false;
}

async function deleteQuery() {
  if (!queryToDelete.value) {
    return;
  }

  deleting.value = true;
  try {
    await CrudSavedQueryProvider.instance.delete(queryToDelete.value._id);
    deleteDialog.value = false;
    queryToDelete.value = null;
    await loadQueries();
  } catch (error) {
    console.error("Error deleting saved query", error);
  } finally {
    deleting.value = false;
  }
}

async function applyQuery(query: ICrudSavedQuery) {
  setVisibleColumns(query.columns || []);
  store.setFilters(buildStaticFilters(clone(query.staticFilters || [])));
  const dynamicFilters = clone(query.dynamicFilters || []);
  store.setDynamicFilters(dynamicFilters);
  store.setDynamicFiltersEnable(dynamicFilters.length > 0);
  store.setPage(1);
  menu.value = false;
  await doPaginate();
}

function onMenuUpdate(value: boolean) {
  menu.value = value;
  if (value) {
    loadQueries();
  }
}
</script>

<template>
  <v-menu
      v-if="canViewSavedQueries"
      :model-value="menu"
      offset-y
      :close-on-content-click="false"
      @update:model-value="onMenuUpdate"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
          v-bind="activatorProps"
          icon
          variant="text"
      >
        <v-icon>mdi-content-save-cog</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ title }}
        </v-tooltip>
      </v-btn>
    </template>

    <v-list min-width="280">
      <v-list-subheader>{{ title }}</v-list-subheader>

      <v-list-item
          v-if="canCreateSavedQueries"
          @click="openSaveDialog"
      >
        <template #prepend>
          <v-icon>mdi-content-save-outline</v-icon>
        </template>
        <v-list-item-title>{{ saveTitle }}</v-list-item-title>
      </v-list-item>

      <v-divider />

      <v-list-item v-if="loading">
        <v-progress-linear indeterminate />
      </v-list-item>

      <v-list-item v-else-if="savedQueries.length === 0">
        <v-list-item-title class="text-medium-emphasis">{{ noQueriesText }}</v-list-item-title>
      </v-list-item>

      <v-list-item
          v-for="query in savedQueries"
          :key="query._id"
          @click="applyQuery(query)"
      >
        <template #prepend>
          <v-icon>{{ query.shared ? "mdi-account-group-outline" : "mdi-account-outline" }}</v-icon>
        </template>
        <v-list-item-title>{{ query.name }}</v-list-item-title>
        <template #append>
          <v-btn
              v-if="canDeleteQuery(query)"
              icon
              variant="text"
              color="red"
              size="small"
              @click.stop="openDeleteDialog(query)"
          >
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="bottom">
              {{ te('action.delete') ? t('action.delete') : 'Delete' }}
            </v-tooltip>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-dialog v-model="saveDialog" max-width="460">
    <v-card>
      <v-card-title>{{ saveTitle }}</v-card-title>
      <v-card-text>
        <v-text-field
            v-model="form.name"
            :label="te('crud.savedQueries.name') ? t('crud.savedQueries.name') : 'Name'"
            density="compact"
            variant="outlined"
            autofocus
        />
        <v-switch
            v-model="form.shared"
            :label="te('crud.savedQueries.shared') ? t('crud.savedQueries.shared') : 'Shared'"
            color="primary"
            hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="saveDialog = false">
          {{ te('action.cancel') ? t('action.cancel') : 'Cancel' }}
        </v-btn>
        <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!form.name.trim()"
            @click="saveQuery"
        >
          {{ te('action.save') ? t('action.save') : 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="460">
    <v-card>
      <v-card-title>{{ deleteTitle }}</v-card-title>
      <v-card-text>
        {{ deleteConfirmText }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">
          {{ te('action.cancel') ? t('action.cancel') : 'Cancel' }}
        </v-btn>
        <v-btn
            color="red"
            variant="flat"
            :loading="deleting"
            @click="deleteQuery"
        >
          {{ te('action.delete') ? t('action.delete') : 'Delete' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
