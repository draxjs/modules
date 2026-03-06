---
name: drax-crud-endpoints
description: Documentation of the capabilities and endpoints provided by the Drax CRUD system for reuse in tasks.
---

# Drax CRUD Endpoints

This skill describes the out-of-the-box endpoints and features provided by the Drax CRUD system. When working on tasks that involve an existing entity (e.g., building a dashboard, custom view, or report), **YOU MUST REUSE** these existing endpoints instead of creating new ones whenever possible.

## Overview

Every entity in the system that extends `AbstractFastifyController` (Backend) and `AbstractCrudRestProvider` (Frontend) automatically inherits a standard set of powerful API endpoints.

**Base URL Pattern:** `/api/<entity-plural>` (e.g., `/api/countries`, `/api/users`)

## Available Endpoints

### 1. Group By (Analytics & Dashboards)
**Use this for:** Creating charts, stats, dashboards, or grouping data by specific fields (dates, categories).

- **Endpoint:** `GET /group-by`
- **Frontend Method:** `provider.groupBy({ fields, filters, dateFormat })`
- **Parameters:**
    - `fields` (required): Comma-separated list of fields to group by.
        - Supports grouping by `Date` fields.
        - Supports grouping by `Reference` fields (will automatically populate the reference).
    - `dateFormat` (optional): Granularity for date fields (`year`, `month`, `day`, `hour`, `minute`, `second`). Default: `day`.
    - `filters` (optional): Standard filter format (see below).
- **Example Usage (Frontend):**
    ```typescript
    // Group users by creation month
    const stats = await UserProvider.instance.groupBy({
        fields: ['createdAt'],
        dateFormat: 'month'
    });
    // Result: [{ createdAt: '2023-01-01...', count: 10 }, ...]
    ```

### 2. Find (List & Filter)
**Use this for:** Fetching lists of items with filtering, sorting, and limiting. Use this when you don't need pagination metadata.

- **Endpoint:** `GET /find`
- **Frontend Method:** `provider.find({ limit, orderBy, order, search, filters })`
- **Parameters:**
    - `limit` (optional): Max number of items.
    - `orderBy` (optional): Field to sort by.
    - `order` (optional): `asc` or `desc`.
    - `search` (optional): Text search string targeting configured search fields.
    - `filters` (optional): Pipe-separated filters (see Syntax).
- **Query Syntax:** `?filters=field;operator;value|field2;eq;val2`

### 3. Paginate (Data Grids)
**Use this for:** displaying paginated tables (DataTables).

- **Endpoint:** `GET /`
- **Frontend Method:** `provider.paginate({ page, limit, orderBy, order, search, filters })`
- **Returns:** `{ items: T[], total: number, page: number, limit: number }`

### 4. Search (Autocomplete)
**Use this for:** Autocomplete inputs or quick search.

- **Endpoint:** `GET /search`
- **Frontend Method:** `provider.search(searchText)`
- **Parameters:**
    - `search` (required): The text to search for.
- **Behavior:** Searches across fields defined in the specific Controller's `_searchFields`.

### 5. Find One
**Use this for:** Getting a single item matching specific criteria.

- **Endpoint:** `GET /find-one`
- **Frontend Method:** `provider.findOne({ search, filters })`

### 6. Export
**Use this for:** Downloading data as CSV or JSON.

- **Endpoint:** `GET /export`
- **Frontend Method:** `provider.export({ format: 'CSV' | 'JSON', ... })`
- **Returns:** `{ url: string, fileName: string }`

### 7. CRUD Operations
Standard REST operations for item management.

- **Get by ID:** `GET /:id` -> `provider.findById(id)`
- **Create:** `POST /` -> `provider.create(data)`
- **Update:** `PUT /:id` -> `provider.update(id, data)`
- **Delete:** `DELETE /:id` -> `provider.delete(id)`

## Filter Syntax

The system uses a standardized string format for filtering in query parameters.

**Format:** `field;operator;value`
**Multiple Filters:** Join with `|` (e.g., `status;eq;active|age;gt;18`)

| Operator | Description | Example |
| :--- | :--- | :--- |
| `eq` | Equals | `status;eq;active` |
| `ne` | Not equals | `type;ne;guest` |
| `gt` | Greater than | `score;gt;10` |
| `lt` | Less than | `price;lt;100` |
| `gte` | Greater/Equal | `age;gte;18` |
| `lte` | Less/Equal | `qty;lte;5` |
| `in` | In list | `role;in;admin,user` |
| `nin` | Not in list | `tag;nin;archive,deleted` |
| `regex` | Regex match | `name;regex;^John` |
| `like` | Partial match | `title;like;project` |

## Frontend Reuse

When implementing custom UI (like a Dashboard):

1.  **Import the Provider:** Always use the Singleton instance of the entity's provider.
    ```typescript
    import CountryProvider from "../../providers/CountryProvider";
    ```
2.  **Call Methods:**
    ```typescript
    // In a Vue component script
    const data = await CountryProvider.instance.find({ limit: 5, orderBy: 'createdAt', order: 'desc' });
    ```
3.  **Do NOT** make raw `axios` or `fetch` calls to these endpoints. Use the Provider.
