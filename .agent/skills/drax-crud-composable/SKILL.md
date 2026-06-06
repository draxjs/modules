---
name: drax-crud-composable
description: Use this skill when working with the Drax Vue CRUD composable useCrud, its Pinia store useCrudStore, or CRUD UI components that depend on them. It explains the public API, state, filters, pagination, navigation, import/export, validation errors, and provider integration patterns in packages/crud/crud-vue/src/composables/UseCrud.ts and stores/UseCrudStore.ts.
---

# Drax CRUD Composable

Use this skill when implementing, debugging, or explaining CRUD behavior that uses `useCrud(entity)` from `packages/crud/crud-vue/src/composables/UseCrud.ts` and `useCrudStore(entity.name)` from `packages/crud/crud-vue/src/stores/UseCrudStore.ts`.

## Source Files

Always verify current behavior in these files before making code changes:

- `packages/crud/crud-vue/src/composables/UseCrud.ts`: composable public API and workflows.
- `packages/crud/crud-vue/src/stores/UseCrudStore.ts`: Pinia state, getters, and actions.
- `packages/crud/crud-share/src/interfaces/IEntityCrud.ts`: entity contract consumed by the composable.
- `packages/crud/crud-vue/src/helpers/CrudRangeFilters.ts`: range filter normalization and expansion.

## Mental Model

`useCrud(entity)` is a Vue composable that binds one `IEntityCrud` definition to an isolated Pinia store named `CrudStore${entity.name}`. Multiple calls with the same `entity.name` share state; different names get separate CRUD state.

The composable exposes store-backed `computed` refs plus workflow functions. Mutating returned refs updates Pinia through store actions. Provider calls are made through `entity.provider`.

## Entity Requirements

The entity should provide these values because `useCrud` reads them directly:

- `name`: store identity suffix.
- `identifier`: field used for update/delete and navigation identity; falls back to `getItemId(item)` where applicable.
- `fields`: used by `cast()` to normalize date, ref, and array.ref values.
- `form`: initial form object used by `onCreate()`.
- `filters`: static filters prepared by `prepareFilters()`.
- `sortBy` and `sortOrder`: optional default sort used by `prepareSort()`.
- `exportHeaders`, `exportHeadersTranslate`, `exportFileName`: used by `doExport()`.
- `dynamicFiltersEnable`: combines with store flag in `isDynamicFiltersEnable`.
- `navigationOperations`: operations allowed for item-to-item navigation; defaults to `['view']` in the composable.
- `redirectOnCreate`: optional callback used after successful create.
- `provider`: object implementing CRUD methods such as `paginate`, `create`, `update`, `delete`, `export`, and `import`.

## Public API

`useCrud(entity)` returns these functions:

- Data workflows: `doPaginate`, `doCreate`, `doUpdate`, `doDelete`, `doExport`, `doImport`.
- UI operation handlers: `onView`, `onCreate`, `onEdit`, `onDelete`, `onCancel`, `onSubmit`.
- Navigation handlers: `onViewAt`, `onEditAt`, `onDeleteAt`, `navigateView`, `resolveViewIndex`, `openItemAt`.
- Filter/sort helpers: `prepareFilters`, `clearFilters`, `applyFilters`, `prepareSort`.
- Utility helpers: `resetCrudStore`, `cloneItem`, `cast`, `prepareEdit`.

It returns these writable state refs and accessors:

- Dialog and operation: `dialog`, `operation`, `getOperation`, `setOperation`, `currentViewIndex`.
- Form: `form`, `getForm`, `setForm`, `formValid`.
- Feedback and errors: `notify`, `message`, `error`, `paginationError`.
- List state: `loading`, `items`, `totalItems`, `itemsPerPage`, `page`, `sortBy`, `search`.
- Filters: `filters`, `isDynamicFiltersEnable`.
- Import/export: `exportFiles`, `importFiles`, `exportLoading`, `importLoading`, `exportListVisible`, `importListVisible`, `exportError`, `importError`.
- Navigation flags: `canNavigateItems`, `canNavigatePrev`, `canNavigateNext`.

## Store State

`useCrudStore(id)` creates a Pinia store with these main state groups:

- Operation/dialog: `operation`, `currentViewIndex`, `dialog`.
- Form and validation: `form`, `formValid`, `inputErrors`.
- Notifications/errors: `notify`, `message`, `error`, `paginationError`.
- Filters: `filters`, `dynamicFilters`, `dynamicFiltersEnable`.
- Listing: `items`, `totalItems`, `itemsPerPage`, `page`, `search`, `sortBy`, `loading`.
- Import/export: `exportLoading`, `importLoading`, `exportFiles`, `importFiles`, `exportListVisible`, `importListVisible`, `exportError`, `importError`.
- Columns: `visibleColumns` for `UseCrudColumns` and saved queries integration.

Store getters:

- `getFieldValue(fieldName)`: returns `form[fieldName]` when truthy, otherwise `undefined`.
- `getFieldInputErrors(fieldName)`: returns `inputErrors[fieldName]` or `[]`.
- `hasFieldListInputErrors(fieldListName)`: checks whether any input error key starts with the list name.
- `getFilterIndex(filterName)`: finds a static filter by `filter.field`.

Store actions mostly set individual state fields. Notable actions are `showMessage`, `resetErrors`, `setFormFieldValue`, `setFilterValue`, dynamic filter mutations, and visible column mutations.

## Pagination

`doPaginate()`:

1. Sets `loading = true` and clears `paginationError`.
2. Calls `entity.provider.paginate()` with `page`, `limit`, first `sortBy` entry, `search`, and `getAllFilters`.
3. On success, writes `items` and `totalItems`.
4. On failure, clears list state, stores `e.message` in `paginationError` when present, logs the error, and resets loading.

Provider payload shape:

```ts
{
  page: store.page,
  limit: store.itemsPerPage,
  orderBy: store.sortBy[0]?.key,
  order: store.sortBy[0]?.order,
  search: store.search,
  filters: getAllFilters.value
}
```

## CRUD Operations

`onCreate()` prepares UI state only: sets `form = entity.form`, resets errors, sets `operation = 'create'`, and opens the dialog.

`onView(item)`, `onEdit(item)`, and `onDelete(item)` cast/clone item data, set the operation, and open the dialog. `prepareEdit(item)` prepares edit form state without opening the dialog.

`onSubmit(formData)` dispatches by current operation:

- `view`: closes dialog and returns `{ status: 'viewed' }`.
- `create`: calls `doCreate(formData)`.
- `edit`: calls `doUpdate(formData)`.
- `delete`: calls `doDelete(formData)`.
- Unknown operation: returns `{ status: 'unknown' }`.

`doCreate(formData)` calls `provider.create(toRaw(formData))`, paginates, closes the dialog, shows a success message, optionally routes through `entity.redirectOnCreate(item)`, and returns `{ status: 'created', item }`.

`doUpdate(formData)` resolves the identifier from `formData[entity.identifier]` or `getItemId(formData)`, calls `provider.update(identifier, toRaw(formData))`, paginates, closes the dialog, shows a success message, and returns `{ status: 'updated', item }`.

`doDelete(formData)` resolves the identifier the same way, calls `provider.delete(identifier)`, paginates, closes the dialog, shows a success message, and returns `{ status: 'deleted' }`.

Create/update/delete catch provider errors, set `inputErrors` if `e.inputErrors` exists, set `error` to a message fallback, log to console, return `{ status: 'error' }`, and always clear `loading`.

## Form Casting

`cast(item)` mutates and returns the item:

- Fields with `type === 'date'` become `new Date(item[field.name])`.
- Fields with `type === 'ref'` become their id through `getItemId(value)` when possible.
- Fields with `type === 'array.ref'` become an array of ids; non-arrays become `[]`.

`onEdit()` and `prepareEdit()` use `cloneItem()` before casting. `cloneItem()` uses JSON serialization and returns `{}` if cloning fails.

## Filters

`prepareFilters()` converts `entity.filters` into store `filters`:

- `field = filter.name`.
- `value = createCrudFilterValue(filter)`.
- `operator = filter.operator || 'eq'`.

`createCrudFilterValue()` preserves `filter.default`; for `operator === 'range'`, it normalizes values to `{ from, to }` and defaults to `{ from: null, to: null }`.

`getAllFilters` combines static filters and dynamic filters, then expands range filters:

- Static filters come from `store.filters`.
- Dynamic filters come from `store.dynamicFilters` mapped as `{ field: filter.name, operator, value }`.
- Range filters expand to `gte` for `from` and `lte` for `to`; empty bounds are omitted.

`clearFilters()` resets static filters from entity defaults, clears `search`, waits for `nextTick`, and paginates. `applyFilters()` only paginates.

Important implementation detail: `setDynamicFilterValue(name, value)` currently uses `getFilterIndex(name)`, which searches `state.filters`, not `state.dynamicFilters`. Verify before relying on it.

## Dynamic Filters

`isDynamicFiltersEnable` is true only when both `entity.dynamicFiltersEnable` and `store.dynamicFiltersEnable` are true.

Default store `dynamicFilters` contains one empty string filter placeholder. UI components can add, remove, or replace dynamic filters with store actions.

## Sorting

`prepareSort()` sets `sortBy` to `[{ key: entity.sortBy, order: entity.sortOrder }]` only when `entity.sortBy` is defined. `doPaginate()` only sends the first sort descriptor.

## Import And Export

`doExport(format)` currently accepts `'JSON'` at type level. It:

- Sets `exportLoading = true` and `exportListVisible = true`.
- Requires `entity.provider.export`.
- Sends format, headers, translated headers, semicolon separator, file name, sort, search, and filters.
- If the result has `url`, adds it to `exportFiles` and shows `Export successful`.
- On error, sets `exportError = true`, logs, and clears loading.

`doImport(file, format)` accepts `'CSV' | 'JSON'`. It:

- Sets `importLoading = true`, `importListVisible = true`, and clears `importError`.
- Requires `entity.provider.import`.
- Calls `provider.import(file, format)`, adds result to `importFiles`, paginates, shows result message or default success, and returns result.
- On error, sets `importError = true`, sets `error`, logs, returns `{ status: 'error' }`, and clears loading.

## Navigation Between Items

Navigation is controlled by `currentViewIndex`, `operation`, and `navigationOperations`.

- `onViewAt(item, index?)`, `onEditAt(item, index?)`, and `onDeleteAt(item, index?)` resolve the item index, store it, and open the matching operation.
- `resolveViewIndex(item, index?)` trusts a valid numeric index first; otherwise it compares `entity.identifier` or `getItemId()` against current `items`; if no identifier is available, it falls back to object identity.
- `canNavigateItems` is true when the current operation is non-null and included in `navigationOperations`.
- `canNavigatePrev` and `canNavigateNext` additionally require a valid `currentViewIndex` and list bounds.
- `navigateView(-1 | 1)` opens the previous or next item using the current operation.
- A watcher clears `currentViewIndex` whenever `dialog` becomes false.

## Common Usage Pattern

```ts
const crud = useCrud(entity)

crud.prepareFilters()
crud.prepareSort()
await crud.doPaginate()

crud.onCreate()
const result = await crud.onSubmit(crud.form.value)
```

In Vue templates, returned `computed` refs are auto-unwrapped. In script code, use `.value` for refs unless destructured through helpers that expect refs.

## Implementation Guidance

When changing CRUD behavior:

- Preserve store-backed writable computed refs so callers can keep using assignment through returned refs.
- Keep provider payloads compatible with existing providers before renaming fields such as `orderBy`, `order`, `search`, or `filters`.
- Avoid adding pagination side effects to pure UI preparers unless current workflows already paginate.
- Be careful with `entity.form`: `onCreate()` assigns it directly, not a clone. If shared mutation is a concern, clone intentionally and test existing forms.
- When adding a new operation, update `IEntityCrudOperation`, `onSubmit`, navigation handling, and any components that branch on `operation`.
- When modifying filter behavior, update both static and dynamic filter paths and verify range expansion.
- Use `paginationError` for list loading failures and `error`/`inputErrors` for form/provider operation failures.

## Testing Checklist

For changes to `useCrud` or `useCrudStore`, cover at least:

- `doPaginate()` success and provider failure.
- Create, update, and delete success paths including pagination and dialog closing.
- `inputErrors` mapping on create/update failures.
- Static filters, dynamic filters, range filters, `clearFilters()`, and `applyFilters()`.
- `prepareSort()` and first-sort-only provider payload behavior.
- Import/export loading, errors, and result list updates.
- Navigation bounds, identity resolution, and dialog-close reset.
- Form casting for `date`, `ref`, and `array.ref` fields.
