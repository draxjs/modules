# Drax Framework - Frontend Entity Creation Guide

This guide outlines the rules and context for creating a new entity. Use this context to generate all necessary files for a new entity.

## Directory Structure
As a reference, For a module named `sales` containing an entity `Customer`:

```
packages/zuite/zuite-front/src/modules/sales/
├── comboboxes/        # [Entity]Combobox.vue
├── components/        # Helper components
├── cruds/             # [Entity]Crud.ts, [Entity]Crud.vue
├── i18n/              # [Entity]-i18n.ts, index.ts
├── interfaces/        # I[Entity].ts
├── pages/
│   └── crud/          # [Entity]CrudPage.vue (Use generic if simple)
├── providers/         # [Entity]Provider.ts
└── routes/            # [Entity]CrudRoute.ts, index.ts
```

## Naming Conventions
- **Entity Name**: PascalCase (e.g., `Customer`).
- **Files**: `[Entity][Suffix].ts` or `[Entity][Suffix].vue`.
- **Interfaces**: `I[Entity]`.

## Layer Implementation Details & Examples (Entity: Customer)

### 1. Interfaces ([interfaces/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/interfaces))
**File**: `I[Entity].ts`
Define the interface matching the backend entity.

```typescript
// interfaces/ICustomer.ts
interface ICustomerBase {
    name: string
    email: string
    phone?: string
    score?: number
    tenant?: any
    createdAt?: Date
    updatedAt?: Date
}

interface ICustomer extends ICustomerBase {
    _id: string
}

export type { ICustomerBase, ICustomer }
```

### 2. Providers ([providers/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/providers))
**File**: `[Entity]Provider.ts`
Extends `AbstractCrudRestProvider` to handle API communication. Singleton pattern.

```typescript
// providers/CustomerProvider.ts
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICustomer, ICustomerBase} from '../interfaces/ICustomer'

class CustomerProvider extends AbstractCrudRestProvider<ICustomer, ICustomerBase, ICustomerBase> {

    static singleton: CustomerProvider

    constructor() {
        super('/api/customers') // Endpoint from backend
    }

    static get instance() {
        if(!CustomerProvider.singleton){
            CustomerProvider.singleton = new CustomerProvider()
        }
        return CustomerProvider.singleton
    }

}

export default CustomerProvider
```

### 3. CRUD Logic ([cruds/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/cruds))
**File**: `[Entity]Crud.ts`
Extends [EntityCrud](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/crud/crud-vue/src/cruds/EntityCrud.ts). This is the central place to define provider, fields, operation-specific form shape, permissions, filters, table behavior, dialog behavior, import/export, and UI defaults.

```typescript
// cruds/CustomerCrud.ts
import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import CustomerProvider from "../providers/CustomerProvider";
import {TenantCrud} from "@drax/identity-vue";

class CustomerCrud extends EntityCrud implements IEntityCrud {

  static singleton: CustomerCrud

  constructor() {
    super();
    this.name = 'Customer'
  }

  static get instance(): CustomerCrud {
    if (!CustomerCrud.singleton) {
      CustomerCrud.singleton = new CustomerCrud()
    }
    return CustomerCrud.singleton
  }

  // --- Layout & UI Config ---
  get containerFluid() { return true }
  
  get dialogFullscreen() { return true }
  
  get dialogZindex() { return 5600 }
  
  get tableStriped(): null | 'odd' | 'even' { return 'even' }
  
  get headerProps() { return { class: 'bg-primary' } }

  // --- Permissions ---
  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'customer:manage',
      view: 'customer:view',
      create: 'customer:create',
      update: 'customer:update',
      delete: 'customer:delete'
    }
  }

  // --- Headers & Fields ---
  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'email', key: 'email', align: 'start'},
      {title: 'phone', key: 'phone', align: 'start'},
      {title: 'score', key: 'score', align: 'start'},
      {title: 'tenant', key: 'tenant', align: 'start'}
    ]
  }

  get actionHeaders(): IEntityCrudHeader[] {
    return [
        { title: 'action.actions', key: 'actions', sortable: false, align: 'center', minWidth: '190px' }
    ]
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', groupTab: 'BASIC'},
      {name: 'email', type: 'string', label: 'email', default: '', groupTab: 'BASIC'},
      {name: 'phone', type: 'string', label: 'phone', default: '', groupTab: 'BASIC'},
      {name: 'score', type: 'number', label: 'score', default: 0, groupTab: 'BASIC'},
      {
        name: 'tenant', 
        type: 'ref', 
        label: 'tenant', 
        default: null, 
        groupTab: 'MANAGE', 
        ref: 'Tenant', 
        refDisplay: 'name'
      }
    ]
  }

  get createFields(): IEntityCrudField[] {
    return this.fields.filter(field => field.name !== 'score')
  }

  get updateFields(): IEntityCrudField[] {
    return this.fields
  }

  get viewFields(): IEntityCrudField[] {
    return this.fields
  }

  // --- tabs (Grouping fields) ---
  get tabs() {
    return ['BASIC', 'MANAGE']
  }

  // --- Provider & Refs ---
  get provider(): IDraxCrudProvider<any, any, any> {
    return CustomerProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Tenant: TenantCrud.instance
    }
  }

  // --- Rules ---
  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      email: [(v: any) => !!v || 'validation.required'], 
      phone: [],
      score: [],
      tenant: []
    }
  }

  // --- Filters ---
  get filters(): IEntityCrudFilter[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: null, operator: "like"},
      {name: 'email', type: 'string', label: 'email', default: null, operator: "like"}
    ]
  }

  get filterButtons() { return true }
  
  get searchEnable() { return true }

  // --- Capabilities ---
  get isViewable() { return true }
  get isEditable() { return true }
  get isCreatable() { return true }
  get isDeletable() { return true }
  get isExportable() { return true }
  get isImportable() { return false }
  
  // --- Export Config ---
  get exportFormats() { return ['CSV', 'JSON'] }
  get exportHeaders() { return ['_id', 'name', 'email'] }

}

export default CustomerCrud
```

Use `fields` as the canonical definition and override operation-specific getters only when create/edit/view/delete must expose a different subset or order of fields.

Common `EntityCrud` members you can override:

- `name`: entity name used by i18n keys and UI.
- `identifier`: item identifier field. Default: `_id`.
- `provider`: required. Must return the CRUD provider instance.
- `permissions`: permissions for `manage`, `view`, `create`, `update`, `delete`.
- `headers`: main list columns.
- `selectedHeaders`: default visible columns when column selector is enabled.
- `actionHeaders`: action column definition.
- `fields`: canonical field list for the entity.
- `createFields`: fields shown in create operation. Default excludes `_id`, `createdAt`, `updatedAt`.
- `updateFields`: fields shown in edit operation. Default excludes `_id`, `createdAt`, `updatedAt`.
- `deleteFields`: fields shown in delete operation. Default uses `fields`.
- `viewFields`: fields shown in view operation. Default uses `fields`.
- `filters`: declared filters for list filtering.
- `refs`: map of `ref` names to other CRUD instances. Required when using `type: 'ref'` or `type: 'array.ref'`.
- `rules`: validation rules by field name.
- `onInputs`: per-field input hooks.
- `tabs`: form tab groups used by `groupTab`.
- `menus`: form side-menu groups used by `groupMenu`.
- `isViewable`, `isEditable`, `isCreatable`, `isDeletable`, `isExportable`, `isImportable`, `isColumnSelectable`, `isGroupable`, `isFilterable`: feature toggles.
- `isItemEditable()`: per-item edit control.
- `isItemDeletable()`: per-item delete control.
- `exportFormats`, `exportHeaders`, `exportFileName`: export behavior.
- `importFormats`: import behavior.
- `searchEnable`, `filtersEnable`, `dynamicFiltersEnable`, `filterButtons`: search and filtering behavior.
- `dialogFullscreen`, `dialogMaxWidth`, `dialogZindex`: dialog behavior.
- `containerFluid`, `cardDensity`, `cardClass`, `toolbarDensity`, `toolbarClass`, `tableDensity`, `headerProps`, `tableStriped`, `footerClass`, `applyFilterClass`, `cleanFilterClass`, `submitBtnFormClass`, `cancelBtnFormClass`: look and feel.
- `inputVariantCreate`, `inputVariantEdit`, `inputVariantView`, `inputVariantDelete`: default input variant by operation.
- `menuMaxHeight`: side menu height when `menus` is used.
- `form`: computed default form payload built from `fields`.
- `formFilters`: computed default filter payload built from `filters`.
- `objectFields(field)`: helper used to construct nested object defaults.
- `getRef(ref)`, `getRule(field)`, `getOnInput(field)`: helper accessors already implemented in the base class.

When to override `createFields` and `updateFields`:

- Use `createFields` when a field should exist in the entity but must not be editable on create.
- Use `updateFields` when edit should expose extra fields not present in create.
- Use `viewFields` and `deleteFields` when the confirmation/view dialog should show a reduced or reordered set of fields.
- Keep the field definition itself in `fields` unless the field truly does not belong to the entity form model.

Available `IEntityCrudField.type` values:

- Scalar types: `id`, `string`, `longString`, `number`, `boolean`, `date`, `password`, `file`, `fullFile`.
- Structured types: `object`, `record`.
- Relation/choice types: `ref`, `enum`, `select`.
- Array types: `array.string`, `array.number`, `array.object`, `array.record`, `array.ref`, `array.enum`, `array.fullFile`.

Field type rules:

- `string`, `longString`, `password`, `id`: normally use `default: ''`.
- `number`: use a numeric default such as `0` when the field should start initialized, otherwise `null`.
- `boolean`: use `default: false` or `true`, never a string.
- `date`: usually use `default: null`. You can combine with `endOfDay`, `showEndOfDayChip`, and `max`.
- `file`, `fullFile`: usually use `default: null`. Use `preview` and `previewHeight` when applicable.
- `enum`: requires `enum: string[]`. Default should match the cardinality, usually `null` or `''` for a single value.
- `select`: requires `items`. Each item must match `IEntityCrudFieldSelectItem`.
- `ref`: requires `ref` and `refDisplay`, and the CRUD must expose the matching instance in `refs`.
- `object`: requires `objectFields` and should use at least `default: {}`.
- `record`: should use at least `default: {}`.
- `array.string`, `array.number`, `array.record`, `array.fullFile`: should use at least `default: []`.
- `array.enum`: requires `enum: string[]` and should use at least `default: []`.
- `array.ref`: requires `ref` and `refDisplay`, and should use at least `default: []`.
- `array.object`: requires `objectFields` and should use at least `default: []`.

Default consistency rules:

- If the type starts with `array.`, the default should be an array. Minimum safe value: `[]`.
- If the type is `object` or `record`, the default should be an object. Minimum safe value: `{}`.
- If the type is scalar, prefer a scalar default consistent with the rendered input.
- Do not mix shapes, for example `type: 'array.string'` with `default: null` or `type: 'object'` with `default: []`.

Useful extra `IEntityCrudField` properties:

- Choice/reference config: `ref`, `refDisplay`, `enum`, `items`, `addOnTheFly`.
- Nested structures: `objectFields`, `arrayObjectUI`, `arrayObjectShowField`, `menuMaxHeight`.
- Form UX: `label`, `hint`, `persistentHint`, `placeholder`, `persistentPlaceholder`, `hideDetails`, `readonly`.
- Icons/media: `prependIcon`, `prependInnerIcon`, `appendIcon`, `appendInnerIcon`, `preview`, `previewHeight`.
- Layout/grouping: `groupTab`, `groupMenu`, `rows`, `cols`, `sm`, `md`, `lg`, `xl`.
- Filtering/behavior: `permission`, `noFilter`, `endOfDay`, `showEndOfDayChip`, `max`.

Examples of field definitions with required companion props:

```typescript
get fields(): IEntityCrudField[] {
  return [
    {name: 'name', type: 'string', label: 'name', default: ''},
    {name: 'description', type: 'longString', label: 'description', default: '', rows: 4},
    {name: 'status', type: 'enum', label: 'status', default: null, enum: ['ACTIVE', 'INACTIVE']},
    {
      name: 'tenant',
      type: 'ref',
      label: 'tenant',
      default: null,
      ref: 'Tenant',
      refDisplay: 'name'
    },
    {
      name: 'profile',
      type: 'object',
      label: 'profile',
      default: {},
      objectFields: [
        {name: 'nickname', type: 'string', label: 'nickname', default: ''},
        {name: 'birthday', type: 'date', label: 'birthday', default: null}
      ]
    },
    {
      name: 'tags',
      type: 'array.string',
      label: 'tags',
      default: []
    },
    {
      name: 'contacts',
      type: 'array.object',
      label: 'contacts',
      default: [],
      objectFields: [
        {name: 'name', type: 'string', label: 'name', default: ''},
        {name: 'email', type: 'string', label: 'email', default: ''}
      ]
    }
  ]
}
```

### 4. CRUD UI ([cruds/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/cruds))
**File**: `[Entity]Crud.vue`
The Vue component wrapping the generic [Crud](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/crud/crud-vue/src/components/Crud.vue) component.

Use this file when the standard CRUD behavior is almost enough and you only need to customize rendering through slots.

Important rules:
- Prefer slots before replacing the whole generic CRUD flow.
- Use `item.<field>` and `field.<field>` first; they are the safest extension points.
- `item.actions` adds custom actions, but the default view/edit/delete buttons are still rendered afterwards when permissions and flags allow them.
- `filters` replaces the full filter area. Prefer `filter.<field>` when you only need to override one filter input.
- `form` replaces the default `CrudForm` completely. Use it only when the generic grouped form cannot solve the requirement.

Available slots in `Crud.vue`:

- `toolbar`: renders on the left side of the toolbar, before the built-in import/export/filter/columns/create buttons. Props: none.
- `toolbar-right`: renders on the right side of the toolbar, after the built-in buttons. Props: none.
- `filters`: replaces the entire filters block. Props: `{ filters }`.
- `filter.<filterName>`: custom renderer for one filter declared in `entity.filters`. Props: `{ filter, filterIndex }`.
- `item.<headerKey>`: custom renderer for one list cell/card value declared in `entity.headers`. Props: `{ item, value }`.
- `item`: replaces the full gallery card body for each item. Props: `{ item }`. This only affects gallery/responsive-card rendering, not the table row layout.
- `item.actions`: injects custom action buttons/actions for each item. Props: `{ item }`.
- `export-table`: customizes the export files list UI. Props: `{ exportFiles }`.
- `tools`: renders inside the dialog, before the form content. Props: none.
- `form`: replaces the entire default dialog form content. Props: none.
- `field.<fieldName>`: custom renderer for one form field declared in `entity.fields`, `createFields`, `updateFields`, `viewFields`, or `deleteFields`. Props: `{ field, form, modelValue, setValue }`.

How to choose the right slot:

- Use `item.<field>` when the list value needs formatting, badges, chips, nested properties, or links.
- Use `field.<field>` when one input needs a custom component, conditional layout, or special interaction.
- `field.<field>` already exposes the reactive form state, so you usually do not need to import `useCrudStore` just to bind the value of that field.
- Prefer `form[field.name]` when your custom component supports a normal `v-model`.
- Prefer `modelValue` + `setValue` when your component API is based on `:model-value` and `@update:model-value`.
- Use `filter.<field>` when a standard filter input is not enough but the default filters container should remain.
- Use `item.actions` for row/card-level actions like impersonate, clone, sync, or open related screens.
- Use `toolbar` or `toolbar-right` for global actions like refresh, bulk actions, or shortcuts.
- Use `tools` for dialog-level helpers that should appear above the form, such as alerts, summaries, or side controls.
- Use `form` only if you need to fully own the create/edit/view/delete UI. In that case, do not expect the generic `CrudForm` events and validation flow to run automatically.

```vue
<!-- cruds/CustomerCrud.vue -->
<script setup lang="ts">
import CustomerCrud from './CustomerCrud'
import {Crud} from "@drax/crud-vue";
</script>

<template>
  <crud :entity="CustomerCrud.instance">
    <template #toolbar-right>
      <v-btn color="secondary" variant="text">Refresh</v-btn>
    </template>

    <template #item.tenant="{ value }">
      <v-chip v-if="value" size="small" color="primary">{{ value.name }}</v-chip>
    </template>

    <template #filter.tenant="{ filter }">
      <TenantCombobox v-model="filter.default" clearable />
    </template>

    <template #field.tenant="{ field, form }">
      <TenantCombobox
        v-model="form[field.name]"
        :label="field.label"
        clearable
      />
    </template>

    <template #field.status="{ field, modelValue, setValue }">
      <StatusSelector
        :label="field.label"
        :model-value="modelValue"
        @update:model-value="setValue"
      />
    </template>

    <template #item.actions="{ item }">
      <v-btn icon="mdi-open-in-new" variant="text" @click="openCustomer(item)" />
    </template>
  </crud>
</template>
```

### 5. i18n ([i18n/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/i18n))
**File**: `[Entity]-i18n.ts`
Translations for fields and permissions.

```typescript
// i18n/Customer-i18n.ts
const messages = {
  en: {
    customer: {
      entity: 'Customer',
      menu: 'Customer',
      crud: 'Manage Customer',
      field: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        score: 'Score',
        tenant: 'Tenant'
      }
    },
    permission: {
      'customer:view': 'View Customer',
      'customer:create': 'Create Customer',
      'customer:update': 'Edit Customer',
      'customer:delete': 'Delete Customer',
      'customer:manage': 'Manage Customer',
    }
  },
  es: {
    customer: {
      entity: 'Cliente',
      menu: 'Cliente',
      crud: 'Gestionar Cliente',
      field: {
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono',
        score: 'Puntaje',
        tenant: 'Tenant'
      }
    },
    permission: {
      'customer:view': 'Ver Cliente',
      'customer:create': 'Crear Cliente',
      'customer:update': 'Editar Cliente',
      'customer:delete': 'Eliminar Cliente',
      'customer:manage': 'Gestionar Cliente',
    }
  }
}
export default messages;
```

### 6. Pages ([pages/crud/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/pages/crud))
**File**: `[Entity]CrudPage.vue`
Usually a simple wrapper around the Crud component.

```vue
<!-- pages/crud/CustomerCrudPage.vue -->
<script setup lang="ts">
import CustomerCrud from "../../cruds/CustomerCrud.vue";
</script>

<template>
  <CustomerCrud/>
</template>
```

### 7. Routes ([routes/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/routes))
**File**: `[Entity]CrudRoute.ts`

```typescript
// routes/CustomerCrudRoute.ts
import CustomerCrudPage from "../pages/crud/CustomerCrudPage.vue";

const CustomerCrudRoute = [
  {
    name: 'CustomerCrudPage',
    path: '/crud/customer',
    component: CustomerCrudPage,
    meta: {
      auth: true,
      permission: 'customer:manage',
    }
  },
]

export default CustomerCrudRoute
export { CustomerCrudRoute }
```

### 8. Combobox ([comboboxes/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/comboboxes))
**File**: `[Entity]Combobox.vue`
Reusable autocomplete component.

```vue
<!-- comboboxes/CustomerCombobox.vue -->
<script setup lang="ts">
import CustomerCrud from '../cruds/CustomerCrud'
import {CrudAutocomplete} from "@drax/crud-vue";
import {IEntityCrudField} from "@drax/crud-share";
import {defineProps} from "vue";
import type {PropType} from "vue";

const valueModel = defineModel<any>({type: String})
const entityName = CustomerCrud.instance.name

const {name, label} = defineProps({
  name: {type: String as PropType<string>, required: false},
  label: {type: String as PropType<string>, required: false},
  itemTitle: {type: [String], default: 'name'},
  itemValue: {type: [String], default: '_id'},
  // ... (include other standard props like multiple, chips, readonly, etc.)
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

const field: IEntityCrudField = {
  default: undefined,
  label: label || entityName,
  name: name || entityName,
  type: 'ref'
}
</script>

<template>
  <crud-autocomplete
    v-model="valueModel"
    :field="field"
    :entity="CustomerCrud.instance"
    :variant="variant"
    :density="density"
    // ... bind other props
  ></crud-autocomplete>
</template>
```

## Setup & Registration
Remember to register routes and i18n in their respective index files.
- [routes/index.ts](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/routes/index.ts): Import `CustomerCrudRoute` and export it in the array.
- [i18n/index.ts](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/i18n/index.ts) (if exists): Import `Customer-i18n` and merge.
