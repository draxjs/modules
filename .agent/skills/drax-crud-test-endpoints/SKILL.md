---
name: drax-crud-test-endpoints
description: Guide for generating comprehensive endpoint tests for Drax CRUD modules using Vitest
---

# Drax CRUD Endpoints Testing Guide

This skill provides comprehensive guidance on generating **endpoint tests** (API routes) for Drax CRUD modules using **Vitest**. Endpoint tests verify HTTP API functionality by simulating requests and validating responses.

## Overview

For each CRUD entity in Drax, create an endpoint test file:

**File location:** `back/test/modules/{module-name}/{entity}/{entity}-endpoints.test.ts`

**Purpose:** Test API endpoints via HTTP requests using Fastify's `inject()` method

## Test Infrastructure

### TestSetup Class

All endpoint tests use the `TestSetup` class which provides:

- **In-memory MongoDB** database for isolated testing
- **Fastify instance** with all middleware configured (JWT, RBAC, API Key)
- **Authentication helpers** (`rootUserLogin`, `basicUserLogin`)
- **Database utilities** (`dropCollection`, `dropAndClose`)
- **Pre-configured users and roles** for permission testing

### Required Imports

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import EntityRoutes from "../../../../src/modules/{module}/routes/EntityRoutes"
import EntityPermissions from "../../../../src/modules/{module}/permissions/EntityPermissions"
import TestSetup from "../../../setup/TestSetup"
import type { IEntityBase } from "../../../../src/modules/{module}/interfaces/IEntity"
```

### Basic Test Structure

```typescript
describe("Entity Endpoints Test", function () {
    
    let testSetup = new TestSetup({
        routes: [EntityRoutes],
        permissions: [EntityPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    // Test cases here
})
```

## Standard CRUD Test Cases

### 1. Create and Find by ID

Tests POST `/api/entities` and GET `/api/entities/:id`

```typescript
it("should create a new {entity} and find by id", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        // Entity fields
        name: "Test Entity",
        description: "Test description"
    }

    const resp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: newEntity,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const entity = await resp.json()
    expect(resp.statusCode).toBe(200)
    expect(entity.name).toBe("Test Entity")
    expect(entity._id).toBeDefined()

    // Verify by fetching
    const getResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities/' + entity._id,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const getEntity = await getResp.json()
    expect(getResp.statusCode).toBe(200)
    expect(getEntity.name).toBe("Test Entity")
})
```

### 2. Create and Update (Full Update - PUT)

Tests PUT `/api/entities/:id` for complete replacement

```typescript
it("should create and update a {entity} and finally find by id", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Original description"
    }

    const resp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: newEntity,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const entity = await resp.json()
    expect(resp.statusCode).toBe(200)
    expect(entity._id).toBeDefined()

    // Prepare update data
    const updateData: IEntityBase = {
        name: "Updated Entity",
        description: "Updated description"
    }

    // Send update request
    const updateResp = await testSetup.fastifyInstance.inject({
        method: 'PUT',
        url: `/api/entities/${entity._id}`,
        payload: updateData,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    expect(updateResp.statusCode).toBe(200)
    const updatedEntity = await updateResp.json()
    expect(updatedEntity.name).toBe("Updated Entity")

    // Verify update persisted
    const verifyResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: `/api/entities/${updatedEntity._id}`,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const verifiedEntity = await verifyResp.json()
    expect(verifyResp.statusCode).toBe(200)
    expect(verifiedEntity.name).toBe("Updated Entity")
})
```

### 3. Create and Partial Update (PATCH)

Tests PATCH `/api/entities/:id` for partial updates

```typescript
it("should create and update partial a {entity} and finally find by id", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Original description"
    }

    const resp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: newEntity,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const entity = await resp.json()
    expect(resp.statusCode).toBe(200)

    // Partial update (only name)
    const updateData: any = {
        name: "Updated Entity"
    }

    const updateResp = await testSetup.fastifyInstance.inject({
        method: 'PATCH',
        url: `/api/entities/${entity._id}`,
        payload: updateData,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    expect(updateResp.statusCode).toBe(200)
    const updatedEntity = await updateResp.json()
    expect(updatedEntity.name).toBe("Updated Entity")

    // Verify update
    const verifyResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: `/api/entities/${updatedEntity._id}`,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const verifiedEntity = await verifyResp.json()
    expect(verifyResp.statusCode).toBe(200)
    expect(verifiedEntity.name).toBe("Updated Entity")
})
```

### 4. Create and Delete

Tests DELETE `/api/entities/:id`

```typescript
it("should create and delete a {entity}", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Test description"
    }

    const createResp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: newEntity,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const createdEntity = await createResp.json()
    expect(createResp.statusCode).toBe(200)
    const entityId = createdEntity._id

    // Delete the entity
    const deleteResp = await testSetup.fastifyInstance.inject({
        method: 'DELETE',
        url: `/api/entities/${entityId}`,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    expect(deleteResp.statusCode).toBe(200)
    const deleteResult = await deleteResp.json()
    expect(deleteResult.deleted).toBe(true)

    // Verify deletion
    const verifyResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: `/api/entities/${entityId}`,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    expect(verifyResp.statusCode).toBe(404)
})
```

### 5. Create and Paginate

Tests GET `/api/entities` with pagination

```typescript
it("Should create and paginate {entities}", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    // Create multiple entities
    const entityData = [
        { name: "Entity 1", description: "Description 1" },
        { name: "Entity 2", description: "Description 2" }
    ]

    for (const data of entityData) {
        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/entities',
            payload: data,
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    }

    const resp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities',
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const result = await resp.json()
    expect(resp.statusCode).toBe(200)
    expect(result.items.length).toBe(2)
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.items[0].name).toBe("Entity 1")
    expect(result.items[1].name).toBe("Entity 2")
})
```

### 6. Create and Search

Tests GET `/api/entities/search?search={term}`

```typescript
it("should create and search for {entities}", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const entityData = [
        { name: "Search Entity 1", description: "Description 1" },
        { name: "Search Entity 2", description: "Description 2" },
        { name: "Other Entity", description: "Description 3" }
    ]

    for (const data of entityData) {
        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/entities',
            payload: data,
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    }

    const searchResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities/search?search=Search',
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const searchResult = await searchResp.json()
    expect(searchResp.statusCode).toBe(200)
    expect(searchResult.length).toBe(2)
    expect(searchResult.some(entity => entity.name === "Search Entity 1")).toBe(true)
    expect(searchResult.some(entity => entity.name === "Search Entity 2")).toBe(true)
})
```

### 7. Create and Find with Filters

Tests GET `/api/entities/find?filters={field};{operator};{value}`

```typescript
it("should create and find {entities} with filters", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const entityData = [
        { name: "Entity 1", status: "active" },
        { name: "Entity 2", status: "inactive" }
    ]

    for (const data of entityData) {
        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/entities',
            payload: data,
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    }

    // Filter by status field
    const findByResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities/find?filters=status;eq;active',
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const findByResult = await findByResp.json()
    expect(findByResp.statusCode).toBe(200)
    expect(Array.isArray(findByResult)).toBe(true)
    expect(findByResult.length).toBe(1)
    expect(findByResult[0].name).toBe("Entity 1")
})
```

### 8. Create and Group By

Tests GET `/api/entities/group-by?fields={field1},{field2}`

```typescript
it("should create and groupBy for {entities}", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()
    await testSetup.dropCollection('Entity')

    const entityData = [
        { name: "Entity 1", type: "typeA", status: "active" },
        { name: "Entity 2", type: "typeB", status: "active" },
        { name: "Entity 3", type: "typeB", status: "active" }
    ]

    for (const data of entityData) {
        await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/entities',
            payload: data,
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    }

    const groupResp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities/group-by?fields=type,status',
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const groupResult = await groupResp.json()
    expect(groupResp.statusCode).toBe(200)
    expect(groupResult[0].count).toBe(2)
    expect(groupResult[0].type).toBe('typeB')
    expect(groupResult[1].count).toBe(1)
    expect(groupResult[1].type).toBe('typeA')
})
```

### 9. Error Handling - Not Found

Tests 404 error responses

```typescript
it("should handle error responses correctly when {entity} is not found", async () => {
    const { accessToken } = await testSetup.rootUserLogin()
    expect(accessToken).toBeTruthy()

    const nonExistentId = "123456789012345678901234" // Valid MongoDB ObjectId

    const resp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: `/api/entities/${nonExistentId}`,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    expect(resp.statusCode).toBe(404)
    const result = await resp.json()
    expect(result.error).toBeDefined()
    expect(result.message).toContain("Not found")
})
```
## Unhappy Path Test Cases

Testing error conditions is critical for robust CRUD modules.

### 1. Authentication (401)
Verify that endpoints require a valid Bearer token.

```typescript
it("should return 401 when accessing endpoints without token", async () => {
    const resp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities'
    });
    expect(resp.statusCode).toBe(401);
});
```

### 2. Authorization (403)
Verify that users with restricted roles cannot perform unauthorized actions.

```typescript
it("should return 403 when creating with restricted user", async () => {
    const { accessToken } = await testSetup.basicUserLogin();
    
    const resp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: { name: "Forbidden" },
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(resp.statusCode).toBe(403);
});
```

### 3. Validation (422)
Verify that invalid data returns `422 Unprocessable Entity`. Drax uses Zod/Mongoose validation which maps to 422.

```typescript
it("should return 422 when creating with missing mandatory fields", async () => {
    const { accessToken } = await testSetup.rootUserLogin();

    const resp = await testSetup.fastifyInstance.inject({
        method: 'POST',
        url: '/api/entities',
        payload: {}, // Missing required fields
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(resp.statusCode).toBe(422);
});
```

### 4. Edge Cases: Invalid IDs (400)
Verify that malformed ObjectIDs return `400 Bad Request`.

```typescript
it("should return 400 when providing invalid ID format", async () => {
    const { accessToken } = await testSetup.rootUserLogin();

    const resp = await testSetup.fastifyInstance.inject({
        method: 'GET',
        url: '/api/entities/invalid-id-format',
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(resp.statusCode).toBe(400);
});
```

### 5. Edge Cases: Non-Existent Resources (404)
Verify that valid but non-existent IDs return `404 Not Found`.

```typescript
it("should return 404 when updating non-existent resource", async () => {
    const { accessToken } = await testSetup.rootUserLogin();
    const nonExistentId = "123456789012345678901234";

    const resp = await testSetup.fastifyInstance.inject({
        method: 'PUT',
        url: `/api/entities/${nonExistentId}`,
        payload: { name: "Non-existent" },
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(resp.statusCode).toBe(404);
});
```

## Complete Example: Notification Endpoints

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import NotificationRoutes from "../../../../src/modules/base/routes/NotificationRoutes"
import NotificationPermissions from "../../../../src/modules/base/permissions/NotificationPermissions"
import TestSetup from "../../../setup/TestSetup"
import type { INotificationBase } from "../../../../src/modules/base/interfaces/INotification"

describe("Notification Endpoints Test", function () {

    let testSetup = new TestSetup({
        routes: [NotificationRoutes],
        permissions: [NotificationPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("should create a new notification and find by id", async () => {
        const { accessToken } = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        await testSetup.dropCollection('Notification')

        const newNotification: INotificationBase = {
            title: "Test Notification",
            message: "This is a test notification message",
            type: "info",
            status: "unread",
            metadata: { best: 'AI', worst: 'OU' },
            user: testSetup.rootUser._id
        }

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/notifications',
            payload: newNotification,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const notification = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(notification.title).toBe("Test Notification")
        expect(notification.metadata.best).toBe("AI")
        expect(notification._id).toBeDefined()

        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/notifications/' + notification._id,
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const getNotification = await getResp.json()
        expect(getResp.statusCode).toBe(200)
        expect(getNotification.title).toBe("Test Notification")
    })

    // Additional test cases following the patterns above...
})
```

## Testing Best Practices

### 1. Test Isolation
- Always drop the collection before each test: `await testSetup.dropCollection('EntityName')`
- Use `beforeAll` for setup and `afterAll` for cleanup
- Each test should be independent

### 2. Authentication
- Use `testSetup.rootUserLogin()` for admin-level access
- Use `testSetup.basicUserLogin()` for restricted access testing
- Always verify `accessToken` is truthy before making requests

### 3. HTTP Request Pattern
```typescript
const resp = await testSetup.fastifyInstance.inject({
    method: 'GET|POST|PUT|PATCH|DELETE',
    url: '/api/entities/...',
    payload: data,  // For POST, PUT, PATCH
    headers: { Authorization: `Bearer ${accessToken}` }
})

const result = await resp.json()
expect(resp.statusCode).toBe(200)
```

### 4. Assertions
- Verify HTTP status codes (200, 404, etc.)
- Check response data structure and values
- Verify data persistence by fetching after mutations
- Test both success and error scenarios

### 5. Test Coverage Checklist

Ensure you cover all 9 essential endpoint tests:
- ✅ Create and Find by ID (POST + GET)
- ✅ Create and Update (PUT)
- ✅ Create and Partial Update (PATCH)
- ✅ Create and Delete (DELETE)
- ✅ Create and Paginate (GET with pagination)
- ✅ Create and Search (GET /search)
- ✅ Create and Find with Filters (GET /find)
- ✅ Create and Group By (GET /group-by)
- ✅ Authentication (401)
- ✅ Authorization (403)
- ✅ Validation (422)
- ✅ Edge Cases: Invalid ID (400) & Not Found (404)

### 6. Naming Conventions
- **File:** `{entity}-endpoints.test.ts`
- **Describe block:** `"{Entity} Endpoints Test"`
- **Test cases:** `"should [action] [expected result]"`

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test notification-endpoints.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Summary

When generating endpoint tests for a new Drax CRUD entity:

1. **Create file:** `back/test/modules/{module}/{entity}/{entity}-endpoints.test.ts`
2. **Import dependencies:** Vitest, Routes, Permissions, TestSetup, interfaces
3. **Configure TestSetup:** With routes and permissions
4. **Implement all 9 essential tests:** CRUD operations, pagination, search, filters, grouping, error handling
5. **Use Vitest:** `describe`, `it`, `beforeAll`, `afterAll`, `expect`
6. **Test via HTTP:** Use `testSetup.fastifyInstance.inject()` for all requests
7. **Verify responses:** Check status codes and response data

This ensures comprehensive test coverage for the API layer of your Drax CRUD modules.
