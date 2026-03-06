---
description: Generate IEntitySchema for Drax Arch Generator CRUDs
---

# Drax Arch Generator - IEntitySchema Guide

## Role & Objective
You are an expert developer using the Drax Framework Arch Generator. Your task is to generate valid `IEntitySchema` objects that define the structure and behavior of entities in the system. These schemas are used to auto-generate backend (Models, Repositories, Services, Controllers) and frontend (CRUD pages, forms, tables) code.

## Interface Definition

The schema must strictly adhere to the following TypeScript interfaces:

```typescript
type IType = 
    | 'string' | 'longString' | 'number' | 'boolean' | 'date' 
    | 'object' | 'ref' | 'enum' | 'password' 
    | 'file' | 'fullFile' 
    | 'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum' | 'array.file' | 'array.fullFile';

interface IFieldSchema {
    type: IType;
    required?: boolean;   // Is the field mandatory?
    index?: boolean;      // Should the field be indexed in the database?
    search?: boolean;     // Is the field searchable in the CRUD list?
    unique?: boolean;     // Must the field value be unique?
    default?: any;        // Default value
    enum?: string[];      // Array of allowed values for 'enum' type
    ref?: string;         // Collection name for 'ref' type (Relations)
    refDisplay?: string;  // Field name to display in frontend for the relation (e.g., 'name')
    schema?: ISchema;     // Nested schema for 'object' or 'array.object'
    header?: boolean;     // Should the field appear in the CRUD list header?
    smCol?: number;       // Grid column size for Small screens (1-12)
    mdCol?: number;       // Grid column size for Medium screens (1-12)
    lgCol?: number;       // Grid column size for Large screens (1-12)
    xlCol?: number;       // Grid column size for Extra Large screens (1-12)
    groupTab?: string;    // Tab name to group this field in the form
    groupMenu?: string;   // Menu group name
}

interface ISchema {
    [key: string]: IFieldSchema;
}

interface IEntitySchema {
    name: string;           // Entity name (PascalCase), e.g., 'Product'
    module: string;         // Module name (camelCase or kebab-case), e.g., 'inventory'
    identifier?: string;    // Optional custom identifier field
    apiBasePath?: string;   // API path prefix, e.g., 'products'
    collectionName?: string;// Database collection name
    apiTag?: string;        // Swagger/API documentation tag
    schema: ISchema;        // The field definitions
    tabs?: string[];        // List of tab names if using tabs in form
    menus?: string[];       // List of menu names if using menus
}
```

## Attribute Explanations

### IEntitySchema (Entity Level)
- **name**: The core name of the entity. Used for class names (e.g., `ProductService`, `ProductModel`).
- **module**: The module this entity belongs to. Affects directory structure.
- **apiBasePath**: The URL prefix for the entity's API endpoints.
- **apiTag**: Used for grouping endpoints in API documentation.
- **schema**: The object defining all fields.

### IFieldSchema (Field Level)
- **type**:
    - `string`: standard text input.
    - `longString`: textarea input.
    - `number`: numeric input.
    - `boolean`: checkbox/switch.
    - `date`: date picker.
    - `object`: nested JSON object.
    - `ref`: ObjectId reference to another entity (Relation).
    - `enum`: Select dropdown from predefined values.
    - `password`: Password field (hashed/hidden).
    - `file` / `fullFile`: File upload handling.
    - `array.*`: Arrays of the above types.
- **required**: Validator for non-empty values.
- **index**: Adds input index to DB.
- **search**: Adds this field to the generic search functionality.
- **unique**: Enforces uniqueness in DB.
- **header**: Controls visibility in the main data table (True = visible).
- **ref**: The *Model Name* of the related entity.
- **refDisplay**: The field of the related entity to show in the dropdown/list (e.g., show the `name` of the `User` instead of the ID).

## Instructions

1.  **File Location**: Schemas are typically located in `packages/zuite/zuite-arch/src/schemas/<module>/<Entity>Schema.ts`.
2.  **Export**: You must export the schema object as `default` and as a named export.
3.  **Imports**: Import `IEntitySchema` from `@drax/arch`.
4.  **Relationships**: When using `type: 'ref'`, always specify `ref` (the related Entity Name) and `refDisplay` (what to show to the user).
5.  **Nested Objects**: Use `type: 'object'` or `type: 'array.object'` and provide the `schema` property for the nested structure.

## Example

Here is a complete example of a complex entity schema covering various field types.

```typescript
import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "inventory",
    name: "Product",
    apiBasePath: 'products',
    apiTag: 'Product',
    schema: {
        // Basic Fields
        name: { 
            type: 'string', 
            required: true, 
            unique: true, 
            index: true, 
            search: true, 
            header: true 
        },
        sku: { 
            type: 'string', 
            required: true, 
            unique: true, 
            index: true, 
            search: true, 
            header: true 
        },
        description: { 
            type: 'longString', 
            required: false, 
            search: true, 
            header: false 
        },
        
        // Numeric & Boolean
        price: { 
            type: 'number', 
            required: true, 
            header: true 
        },
        isActive: { 
            type: 'boolean', 
            default: true, 
            header: true 
        },
        
        // Enum
        category: { 
            type: 'enum', 
            enum: ['Electronics', 'Clothing', 'Home', 'Toys'], 
            required: true, 
            header: true 
        },

        // Relation (Reference)
        supplier: {
            type: 'ref',
            ref: 'Supplier',       // Refers to SupplierModel
            refDisplay: 'name',    // Shows Supplier.name in UI
            required: true,
            header: true
        },

        // Nested Object
        dimensions: {
            type: 'object',
            required: false,
            schema: {
                width: { type: 'number', required: true },
                height: { type: 'number', required: true },
                depth: { type: 'number', required: true },
                unit: { type: 'enum', enum: ['cm', 'in'], default: 'cm' }
            }
        },

        // Array of Objects
        variants: {
            type: 'array.object',
            required: false,
            schema: {
                color: { type: 'string', required: true },
                size: { type: 'string', required: true },
                stock: { type: 'number', required: true, default: 0 }
            }
        },

        // Files
        manual: {
            type: 'file',
            required: false
        }
    }
}

export default entitySchema;
export { entitySchema };
```
