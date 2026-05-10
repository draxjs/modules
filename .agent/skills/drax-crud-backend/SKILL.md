---
name: drax-crud-backend
description: Guia para crear o modificar entidades CRUD backend en Drax usando AbstractService, AbstractFastifyController, filtros IDraxFieldFilter, repositorios, schemas, permissions, factories y routes. Usar cuando el usuario pida generar CRUDs, agregar endpoints, acciones, filtros, imports, exports, groupBy, hooks, service methods o controllers backend; priorizar siempre los metodos existentes de AbstractService y AbstractFastifyController antes de crear metodos nuevos.
---

# Drax Framework - Entity Creation Guide

This guide outlines the rules and context for creating a new entity crud. Use this context to generate all necessary files for a new entity.

## Core Rule

Before creating a custom controller action, custom service method, or custom route, check whether `AbstractFastifyController` and `AbstractService` already provide the behavior.

Prioritize existing base methods because they already handle permissions, tenant/user filtering and assertions, validation, hooks, events, imports/exports, and consistent response shape.

Primary references:

- `packages/crud/crud-back/src/controllers/AbstractFastifyController.ts`
- `packages/crud/crud-back/src/services/AbstractService.ts`
- `packages/crud/crud-back/src/builders/CrudSchemaBuilder.ts`
- `packages/crud/crud-share/src/interfaces/IDraxFieldFilter.ts`
- `packages/common/common-back/src/mongoose/MongooseQueryFilter.ts`

## Directory Structure
As a reference, for a module named `sales` containing an entity `Customer`:

```
packages/zuite/zuite-back/src/modules/sales/
├── controllers/       # [Entity]Controller.ts
├── factory/
│   └── services/      # [Entity]ServiceFactory.ts
├── interfaces/        # I[Entity].ts, I[Entity]Repository.ts
├── models/            # [Entity]Model.ts (Mongoose)
├── permissions/       # [Entity]Permissions.ts
├── repository/
│   ├── mongo/         # [Entity]MongoRepository.ts
│   └── sqlite/        # [Entity]SqliteRepository.ts
├── routes/            # [Entity]Routes.ts
├── schemas/           # [Entity]Schema.ts (Zod)
└── services/          # [Entity]Service.ts
```

## Layer Implementation Details & Examples

### 1. Interfaces ([interfaces/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/interfaces))
**File**: `I[Entity].ts`

```typescript
// interfaces/ICustomer.ts
interface ICustomerBase {
    name: string;
    email: string;
    phone?: string;
    score?: number;
    tenant?: any; // Use 'any' to avoid strict circular types in interfaces if needed
    createdAt?: Date;
    updatedAt?: Date;
}

interface ICustomer extends ICustomerBase {
    _id: string;
}

export type { ICustomerBase, ICustomer };
```

**File**: `I[Entity]Repository.ts`

```typescript
// interfaces/ICustomerRepository.ts
import { IDraxCrudRepository } from "@drax/crud-share";
import { ICustomer, ICustomerBase } from "./ICustomer";

interface ICustomerRepository extends IDraxCrudRepository<ICustomer, ICustomerBase, ICustomerBase> {}

export { ICustomerRepository };
```

### 2. Permissions ([permissions/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/permissions))
**File**: `[Entity]Permissions.ts`

```typescript
// permissions/CustomerPermissions.ts
enum CustomerPermissions {
    Create = "customer:create",
    Update = "customer:update",
    Delete = "customer:delete",
    View = "customer:view",
    Manage = "customer:manage"
}
export { CustomerPermissions };
export default CustomerPermissions;
```

### 3. Models ([models/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/models))
**File**: `[Entity]Model.ts`

```typescript
// models/CustomerModel.ts
import { mongoose } from '@drax/common-back';
import { PaginateModel } from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
import type { ICustomer } from '../interfaces/ICustomer';

const CustomerSchema = new mongoose.Schema<ICustomer>({
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: false },
    score: { type: Number, required: false, default: 0 },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false }
}, { timestamps: true });

CustomerSchema.plugin(uniqueValidator, { message: 'validation.unique' });
CustomerSchema.plugin(mongoosePaginate);

CustomerSchema.virtual("id").get(function () {
    return this._id.toString();
});

CustomerSchema.set('toJSON', { getters: true, virtuals: true });
CustomerSchema.set('toObject', { getters: true, virtuals: true });

const CustomerModel = mongoose.model<ICustomer, PaginateModel<ICustomer>>('Customer', CustomerSchema, 'Customer');

export { CustomerSchema, CustomerModel };
export default CustomerModel;
```

### 4. Schemas ([schemas/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/schemas))
**File**: `[Entity]Schema.ts`

```typescript
// schemas/CustomerSchema.ts
import { z } from 'zod';

const CustomerBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    email: z.string().email('validation.email').min(1, 'validation.required'),
    phone: z.string().optional(),
    score: z.number().optional().default(0),
    tenant: z.string().optional().nullable()
});

const CustomerSchema = CustomerBaseSchema.extend({
    _id: z.string(),
    tenant: z.object({ _id: z.string(), name: z.string() }).nullable().optional()
});

export default CustomerSchema;
export { CustomerSchema, CustomerBaseSchema };
```

### 5. Repositories ([repository/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/repository))
**File**: `repository/mongo/[Entity]MongoRepository.ts`

```typescript
// repository/mongo/CustomerMongoRepository.ts
import { AbstractMongoRepository } from "@drax/crud-back";
import { CustomerModel } from "../../models/CustomerModel.js";
import type { ICustomerRepository } from '../../interfaces/ICustomerRepository';
import type { ICustomer, ICustomerBase } from "../../interfaces/ICustomer";

class CustomerMongoRepository extends AbstractMongoRepository<ICustomer, ICustomerBase, ICustomerBase> implements ICustomerRepository {
    constructor() {
        super();
        this._model = CustomerModel;
        this._searchFields = ['name', 'email', 'phone'];
        this._populateFields = ['tenant'];
    }
}

export default CustomerMongoRepository;
export { CustomerMongoRepository };
```

### 6. Services ([services/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/services))
**File**: `[Entity]Service.ts`

```typescript
// services/CustomerService.ts
import { AbstractService } from "@drax/crud-back";
import type { ICustomerRepository } from "../interfaces/ICustomerRepository";
import type { ICustomer, ICustomerBase } from "../interfaces/ICustomer";
import type { ZodObject, ZodRawShape } from "zod";

class CustomerService extends AbstractService<ICustomer, ICustomerBase, ICustomerBase> {
    constructor(repository: ICustomerRepository, schema?: ZodObject<ZodRawShape>) {
        super(repository, schema);
    }
}

export default CustomerService;
export { CustomerService };
```

#### AbstractService methods available

Use these methods from `AbstractService<T, C, U>` before adding new service methods:

| Need | Existing method |
| --- | --- |
| Create item | `create(data)` |
| Full update | `update(id, data)` |
| Partial update / PATCH | `updatePartial(id, data)` |
| Delete | `delete(id)` |
| Get by id | `findById(id)` |
| Get many by ids | `findByIds(ids)` |
| Get one by field | `findOneBy(field, value, filters?)` |
| Get many by field | `findBy(field, value, limit?, filters?)` |
| Get first matching search/filters | `findOne({ search, filters })` |
| Get all | `fetchAll()` |
| Text search | `search(value, limit?, filters?)` |
| List with options | `find({ orderBy, order, search, filters, limit })` |
| Paginate | `paginate({ page, limit, orderBy, order, search, filters })` |
| Group/aggregate counts | `groupBy({ fields, filters, dateFormat })` |
| Export JSON/CSV | `export(options, destinationPath)` |
| Parse import content | `parseImport({ format, content, separator })` |
| Import JSON/CSV | `import({ format, content, separator })` |

#### AbstractService extension points

Prefer hooks/transforms over rewriting CRUD logic:

- `transformCreate(data)` before repository `create`.
- `transformUpdate(data)` before full `update`.
- `transformUpdatePartial(data)` before partial `updatePartial`.
- `transformRead(item)` after read operations.
- `onCreated(item)`, `onUpdated(item)`, `onUpdatedPartial(item)`, `onDeleted(id)` after mutations.
- `validateInputCreate`, `validateInputUpdate`, `validateInputUpdatePartial`, `validateOutput` already use the configured Zod schemas.

Example:

```typescript
class CustomerService extends AbstractService<ICustomer, ICustomerBase, ICustomerBase> {
    constructor(repository: ICustomerRepository, schema?: ZodObject<ZodRawShape>) {
        super(repository, schema);

        this.transformCreate = async (data) => ({
            ...data,
            email: data.email?.trim().toLowerCase(),
        });
    }
}
```

### 7. Factory ([factory/services/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/factory/services))
**File**: `[Entity]ServiceFactory.ts`

```typescript
// factory/services/CustomerServiceFactory.ts
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
import CustomerMongoRepository from '../../repository/mongo/CustomerMongoRepository.js';
// import CustomerSqliteRepository ...
import { CustomerService } from '../../services/CustomerService.js';
import { CustomerBaseSchema } from "../../schemas/CustomerSchema.js";
import type { ICustomerRepository } from "../../interfaces/ICustomerRepository";

class CustomerServiceFactory {
    private static service: CustomerService;

    public static get instance(): CustomerService {
        if (!CustomerServiceFactory.service) {
            let repository: ICustomerRepository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CustomerMongoRepository();
                    break;
                // case COMMON.DB_ENGINES.SQLITE: ...
                default:
                    throw new Error("Invalid DB Engine");
            }
            CustomerServiceFactory.service = new CustomerService(repository, CustomerBaseSchema);
        }
        return CustomerServiceFactory.service;
    }
}

export default CustomerServiceFactory;
export { CustomerServiceFactory };
```

### 8. Controllers ([controllers/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/controllers))
**File**: `[Entity]Controller.ts`

```typescript
// controllers/CustomerController.ts
import { AbstractFastifyController } from "@drax/crud-back";
import CustomerServiceFactory from "../factory/services/CustomerServiceFactory.js";
import CustomerPermissions from "../permissions/CustomerPermissions.js";
import type { ICustomer, ICustomerBase } from "../interfaces/ICustomer";

class CustomerController extends AbstractFastifyController<ICustomer, ICustomerBase, ICustomerBase> {
    constructor() {
        super(CustomerServiceFactory.instance, CustomerPermissions);
        this.tenantField = "tenant";
        // this.userField = "user"; // Uncomment if user field is needed
        this.tenantFilter = true;
        // this.userFilter = true;
        this.tenantSetter = true;
        // this.userSetter = true;
        this.tenantAssert = true;
        // this.userAssert = true;
    }
}

export default CustomerController;
export { CustomerController };
```

#### AbstractFastifyController action methods available

Use these controller actions before creating custom actions:

| Need | Existing controller method | Typical route |
| --- | --- | --- |
| Create | `create(req, rep)` | `POST /api/customers` |
| Full update | `update(req, rep)` | `PUT /api/customers/:id` |
| Partial update | `updatePartial(req, rep)` | `PATCH /api/customers/:id` |
| Delete | `delete(req, rep)` | `DELETE /api/customers/:id` |
| Get by id | `findById(req, rep)` | `GET /api/customers/:id` |
| Get by ids | `findByIds(req, rep)` | `GET /api/customers/ids/:ids` |
| Find list | `find(req, rep)` | `GET /api/customers/find` |
| Find one | `findOne(req, rep)` | `GET /api/customers/find-one` |
| Find many by field | `findBy(req, rep)` | `GET /api/customers/find-by/:field/:value` |
| Find one by field | `findOneBy(req, rep)` | `GET /api/customers/find-one-by/:field/:value` |
| Search | `search(req, rep)` | `GET /api/customers/search` |
| Paginate | `paginate(req, rep)` | `GET /api/customers` |
| Group by fields | `groupBy(req, rep)` | `GET /api/customers/group-by` |
| Export JSON/CSV | `export(req, rep)` | `GET /api/customers/export` |
| Import JSON/CSV | `import(req, rep)` | `POST /api/customers/import` |

#### AbstractFastifyController hooks and controls

Prefer overriding hooks/configuration instead of duplicating controller methods:

- `preCreate(request, payload)` and `postCreate(request, item)`.
- `preUpdate(request, payload)` and `postUpdate(request, item)`.
- `preUpdatePartial(request, payload)` and `postUpdatePartial(request, item)`.
- `preDelete(request, item)` and `postDelete(request, item)`.
- `preRead(request, filters)` to add or modify read filters.
- `postRead(request, item)`, `postReadItem`, `postReadItems`, `postReadPaginate` to shape read responses.
- `onCreated`, `onUpdated`, `onDeleted`, `onExported` emit CRUD events; override only when the event behavior must change.
- `tenantField`, `userField`, `tenantFilter`, `userFilter`, `tenantSetter`, `userSetter`, `tenantAssert`, `userAssert` control ownership behavior.
- `defaultLimit` and `maximumLimit` control read limits.

Example:

```typescript
class CustomerController extends AbstractFastifyController<ICustomer, ICustomerBase, ICustomerBase> {
    constructor() {
        super(CustomerServiceFactory.instance, CustomerPermissions);
        this.tenantField = "tenant";
        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;
    }

    async preRead(request, filters) {
        filters.push({ field: "active", operator: "eq", value: true });
        return filters;
    }
}
```

### 9. Routes ([routes/](file:///media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/modules/people/routes))
**File**: `[Entity]Routes.ts`

```typescript
// routes/CustomerRoutes.ts
import CustomerController from "../controllers/CustomerController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { CustomerSchema, CustomerBaseSchema } from '../schemas/CustomerSchema.js';

async function CustomerFastifyRoutes(fastify, options) {
    const controller = new CustomerController();
    // 'customers' is the tag for the swagger documentation
    const schemas = new CrudSchemaBuilder(CustomerSchema, CustomerBaseSchema, CustomerBaseSchema, 'Customer', 'openapi-3.0', ['customers']);

    // Plural path: /api/customers
    fastify.get('/api/customers', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/customers/ids/:ids', { schema: schemas.findByIdsSchema }, (req, rep) => controller.findByIds(req, rep));
    fastify.get('/api/customers/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/customers/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/customers/find-by/:field/:value', { schema: schemas.findBySchema }, (req, rep) => controller.findBy(req, rep));
    fastify.get('/api/customers/find-one-by/:field/:value', { schema: schemas.findOneBySchema }, (req, rep) => controller.findOneBy(req, rep));
    fastify.get('/api/customers/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/customers/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.get('/api/customers/export', { schema: schemas.exportSchema }, (req, rep) => controller.export(req, rep));
    fastify.get('/api/customers/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.post('/api/customers/import', (req, rep) => controller.import(req, rep));
    fastify.post('/api/customers', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/customers/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/customers/:id', { schema: schemas.updatePartialSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/customers/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
}

export default CustomerFastifyRoutes;
export { CustomerFastifyRoutes };
```

#### Route guidance

- Register only the actions the entity should expose, but prefer these base actions when the behavior matches.
- Use `CrudSchemaBuilder` schemas when available: `paginateSchema`, `findSchema`, `findOneSchema`, `findByIdSchema`, `findByIdsSchema`, `findBySchema`, `findOneBySchema`, `searchSchema`, `groupBySchema`, `exportSchema`, `createSchema`, `updateSchema`, `updatePartialSchema`, `deleteSchema`.
- If a route needs custom filtering, prefer overriding `preRead` in the controller.
- If a route needs custom payload changes, prefer `preCreate`, `preUpdate`, `preUpdatePartial`, or service transforms.
- Create a new controller action only when no base action can express the behavior.

## Filters

Use `IDraxFieldFilter` for backend filtering instead of creating custom methods for common reads.

```typescript
interface IDraxFieldFilter {
    field: string;
    operator: string;
    value: any;
    orGroup?: string;
}
```

Supported operators in the current Mongoose filter mapper:

| Operator | Meaning |
| --- | --- |
| `eq` | equals |
| `ne` | not equals |
| `like` | case-insensitive regex contains |
| `in` | value is in comma-separated or array list |
| `nin` | value is not in comma-separated or array list |
| `gt` | greater than |
| `gte` | greater than or equal |
| `lt` | less than |
| `lte` | less than or equal |
| `empty` | null or empty string; for ObjectId, null |

Controller query string format:

```text
filters=field;operator;value[;orGroup]|field;operator;value[;orGroup]
```

Examples:

```text
GET /api/customers?filters=status;eq;active
GET /api/customers/find?filters=name;like;acme|score;gte;80
GET /api/customers/group-by?fields=status&filters=createdAt;gte;2026-01-01
GET /api/customers?filters=status;eq;active;stateGroup|status;eq;pending;stateGroup
```

Rules:

- Filters without `orGroup` are combined as `AND`.
- Filters sharing the same `orGroup` are combined as an `OR` group.
- Multiple `orGroup` groups are combined with the other conditions as `AND`.
- For `in` and `nin`, pass values as `a,b,c` in query strings or arrays in service calls.
- ISO date strings are cast to `Date`; valid ObjectId strings are cast for ObjectId fields.
- The controller parses query `filters` in `find`, `findOne`, `paginate`, `export`, and `groupBy`.
- `findBy`, `findOneBy`, and `search` receive tenant/user filters and `preRead` filters, but do not parse query `filters` in the base controller.
- For fixed backend filters, use `preRead` instead of making a new action.

Service examples:

```typescript
const filters = [
    { field: "status", operator: "eq", value: "active" },
    { field: "score", operator: "gte", value: 80 },
];

const customers = await customerService.find({ filters, orderBy: "name", order: "asc" });
const page = await customerService.paginate({ page: 1, limit: 20, filters });
const grouped = await customerService.groupBy({ fields: ["status"], filters });
```

## 10. Route Registration
**File**: back/src/factories/FastifyServerFactory.ts
You **MUST** register your new entity route in the server factory for it to be active.

1.  **Import the route**:
    ```typescript
    import { CustomerFastifyRoutes } from "../modules/sales/routes/CustomerRoutes.js";
    ```
2.  **Register the route** inside FastifyServerFactory function:
    ```typescript
    server.fastifyRegister(CustomerFastifyRoutes);
    ```


## Anti-patterns (DO NOT DO)

- Do not place business logic in controllers
- Do not access database from services
- Do not skip tests
- Do not create custom `findByStatus`, `findByTenant`, `searchByName`, `exportCsv`, or `patch` methods if `findBy`, `find`, `search`, `export`, or `updatePartial` already cover the case.
- Do not duplicate permission, tenant, user, validation, event, import, or export logic that already exists in `AbstractFastifyController` or `AbstractService`.
