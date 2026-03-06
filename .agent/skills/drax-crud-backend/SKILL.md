# Drax Framework - Entity Creation Guide

This guide outlines the rules and context for creating a new entity crud. Use this context to generate all necessary files for a new entity.

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
    fastify.get('/api/customers/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/customers/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/customers/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.post('/api/customers', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/customers/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.delete('/api/customers/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
}

export default CustomerFastifyRoutes;
export { CustomerFastifyRoutes };
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


## Anti-patterns (DO NOT DO)

- Do not place business logic in controllers
- Do not access database from services
- Do not skip tests
