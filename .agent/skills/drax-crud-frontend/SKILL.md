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
Extends [EntityCrud](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/crud/crud-vue/src/EntityCrud.ts#8-313). Defines fields, rules, headers, and configuration.

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
  
  get striped(): null | 'odd' | 'even' { return 'even' }
  
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

### 4. CRUD UI ([cruds/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/cruds))
**File**: `[Entity]Crud.vue`
The Vue component wrapping the generic [crud](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/modules/people/pages/crud) component.

```vue
<!-- cruds/CustomerCrud.vue -->
<script setup lang="ts">
import CustomerCrud from './CustomerCrud'
import {Crud} from "@drax/crud-vue";
</script>

<template>
  <crud :entity="CustomerCrud.instance">
    <!-- Customize slots for specific field rendering if needed -->
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
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
