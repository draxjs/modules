---
name: drax-crud-test-services
description: Guide for generating comprehensive service layer tests for Drax CRUD modules using Vitest
---

# Drax CRUD Service Testing Guide

This skill provides comprehensive guidance on generating **service layer tests** for Drax CRUD modules using **Vitest**. Service tests verify business logic by testing service methods directly, without the HTTP layer.

## Overview

For each CRUD entity in Drax, create a service test file:

**File location:** `back/test/modules/{module-name}/{entity}/{entity}-service.test.ts`

**Purpose:** Test service layer methods directly (business logic, database operations)

## Test Infrastructure

### TestSetup Class

All service tests use the `TestSetup` class which provides:

- **In-memory MongoDB** database for isolated testing
- **Database utilities** (`dropCollection`, `dropAndClose`)
- **Pre-configured users** (`rootUser`, `basicUser`) for testing user-related operations

### Required Imports

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import EntityServiceFactory from "../../../../src/modules/{module}/factory/services/EntityServiceFactory"
import EntityService from "../../../../src/modules/{module}/services/EntityService"
import TestSetup from "../../../setup/TestSetup"
import type { IEntityBase } from "../../../../src/modules/{module}/interfaces/IEntity"
```

### Basic Test Structure

```typescript
describe("Entity Service Test", function () {

    let testSetup = new TestSetup()
    let entityService: EntityService

    beforeAll(async () => {
        await testSetup.setup()
        entityService = EntityServiceFactory.instance
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    // Test cases here
})
```

## Essential Test Cases

### 1. Create and Find by ID

Tests `create()` and `findById()` methods

```typescript
it("should create a new {entity} and find by id", async () => {
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Test description"
    }

    const entity = await entityService.create(newEntity)

    expect(entity.name).toBe("Test Entity")
    expect(entity._id).toBeDefined()

    const getEntity = await entityService.findById(entity._id)
    expect(getEntity?.name).toBe("Test Entity")
})
```

### 2. Create and Update

Tests `update()` method for full updates

```typescript
it("should create and update a {entity} and finally find by id", async () => {
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Original description"
    }

    const entity = await entityService.create(newEntity)

    const updateData: IEntityBase = {
        name: "Updated Entity",
        description: "Updated description"
    }

    const updatedEntity = await entityService.update(entity._id, updateData)

    expect(updatedEntity.name).toBe("Updated Entity")
    expect(updatedEntity.description).toBe("Updated description")

    const getEntity = await entityService.findById(entity._id)
    expect(getEntity?.name).toBe("Updated Entity")
})
```

### 3. Create and Delete

Tests `delete()` method

```typescript
it("should create and delete a {entity}", async () => {
    await testSetup.dropCollection('Entity')

    const newEntity: IEntityBase = {
        name: "Test Entity",
        description: "Test description"
    }

    const entity = await entityService.create(newEntity)
    expect(entity._id).toBeDefined()

    const deleteResult = await entityService.delete(entity._id)
    expect(deleteResult).toBe(true)

    const getEntity = await entityService.findById(entity._id)
    expect(getEntity).toBe(null)
})
```

### 4. Create and Paginate

Tests `paginate()` method

```typescript
it("Should create and paginate {entities}", async () => {
    await testSetup.dropCollection('Entity')

    const entityData: IEntityBase[] = [
        { name: "Entity 1", description: "Description 1" },
        { name: "Entity 2", description: "Description 2" }
    ]

    for (const data of entityData) {
        await entityService.create(data)
    }

    const result = await entityService.paginate({ page: 1, limit: 10 })

    expect(result.items.length).toBe(2)
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.items[0].name).toBe("Entity 1")
})
```

### 5. Search

Tests `search()` method

```typescript
it("should search for {entities}", async () => {
    await testSetup.dropCollection('Entity')

    const entityData: IEntityBase[] = [
        { name: "SearchEntity1", description: "Description 1" },
        { name: "SearchEntity2", description: "Description 2" },
        { name: "OtherEntity", description: "Description 3" }
    ]

    for (const data of entityData) {
        await entityService.create(data)
    }

    const searchResult = await entityService.search("Search")

    expect(searchResult.length).toBe(2)
    expect(searchResult.some(e => e.name === "SearchEntity1")).toBe(true)
    expect(searchResult.some(e => e.name === "SearchEntity2")).toBe(true)
    expect(searchResult.some(e => e.name === "OtherEntity")).toBe(false)
})
```

### 6. Find with Filters

Tests `find()` method with filter criteria

```typescript
it("should find {entities} with filters", async () => {
    await testSetup.dropCollection('Entity')

    const entityData: IEntityBase[] = [
        { name: "FilterEntityA", status: "active" },
        { name: "FilterEntityB", status: "inactive" }
    ]

    for (const data of entityData) {
        await entityService.create(data)
    }

    const findByResult = await entityService.find({
        filters: [
            { field: "status", operator: "eq", value: "active" }
        ]
    })

    expect(Array.isArray(findByResult)).toBe(true)
    expect(findByResult.length).toBe(1)
    expect(findByResult[0].name).toBe("FilterEntityA")
})
```

### 7. Error Handling - Not Found

Tests error handling when entity doesn't exist

```typescript
it("should handle error responses correctly when {entity} is not found", async () => {
    const nonExistentId = "123456789012345678901234"

    const resp = await entityService.findById(nonExistentId)

    expect(resp).toBe(null)
})
```

## Complete Example: Notification Service

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import NotificationServiceFactory from "../../../../src/modules/base/factory/services/NotificationServiceFactory"
import NotificationService from "../../../../src/modules/base/services/NotificationService"
import TestSetup from "../../../setup/TestSetup"
import type { INotificationBase } from "../../../../src/modules/base/interfaces/INotification"

describe("Notification Service Test", function () {

    let testSetup = new TestSetup()
    let notificationService: NotificationService

    beforeAll(async () => {
        await testSetup.setup()
        notificationService = NotificationServiceFactory.instance
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("should create a new notification and find by id", async () => {
        await testSetup.dropCollection('Notification')

        const newNotification: INotificationBase = {
            title: "Test Notification",
            message: "This is a test notification message",
            type: "info",
            status: "unread",
            user: testSetup.rootUser._id
        }

        const notification = await notificationService.create(newNotification)

        expect(notification.title).toBe("Test Notification")
        expect(notification._id).toBeDefined()

        const getNotification = await notificationService.findById(notification._id)
        expect(getNotification?.title).toBe("Test Notification")
    })

    it("should create and update a notification and finally find by id", async () => {
        await testSetup.dropCollection('Notification')

        const newNotification: INotificationBase = {
            title: "Test Notification",
            message: "This is a test notification message",
            type: "info",
            status: "unread",
            user: testSetup.rootUser._id
        }

        const notification = await notificationService.create(newNotification)

        const updateData: INotificationBase = {
            title: "Updated Notification",
            message: "Updated message",
            type: "warning",
            status: "read",
            user: testSetup.rootUser._id
        }

        const updatedNotification = await notificationService.update(notification._id, updateData)

        expect(updatedNotification.title).toBe("Updated Notification")
        expect(updatedNotification.type).toBe("warning")

        const getNotification = await notificationService.findById(notification._id)
        expect(getNotification?.title).toBe("Updated Notification")
        expect(getNotification?.status).toBe("read")
    })

    // Additional test cases following the patterns above...
})
```

## Testing Best Practices

### 1. Test Isolation
- Always drop the collection before each test: `await testSetup.dropCollection('EntityName')`
- Use `beforeAll` for setup and `afterAll` for cleanup
- Each test should be independent

### 2. Service Instance
- Get service instance from Factory: `EntityServiceFactory.instance`
- Initialize in `beforeAll` hook
- Reuse the same instance across all tests

### 3. Direct Method Calls
```typescript
// Create
const entity = await entityService.create(data)

// Read
const entity = await entityService.findById(id)
const entities = await entityService.paginate({ page: 1, limit: 10 })
const results = await entityService.search("term")
const filtered = await entityService.find({ filters: [...] })

// Update
const updated = await entityService.update(id, data)

// Delete
const deleted = await entityService.delete(id)
```

### 4. Assertions
- Verify return values and data types
- Check that IDs are defined after creation
- Verify data persistence by fetching after mutations
- Test both success and error scenarios
- Use optional chaining for nullable results: `entity?.name`

### 5. Test Coverage Checklist

Ensure you cover all 7 essential service tests:
- ✅ Create and Find by ID
- ✅ Create and Update
- ✅ Create and Delete
- ✅ Create and Paginate
- ✅ Search
- ✅ Find with Filters
- ✅ Error Handling (Not Found)

### 6. Naming Conventions
- **File:** `{entity}-service.test.ts`
- **Describe block:** `"{Entity} Service Test"`
- **Test cases:** `"should [action] [expected result]"`

### 7. Using Test Users
```typescript
// Use pre-configured users for user-related fields
const newEntity = {
    name: "Test",
    user: testSetup.rootUser._id
}

// Or use basicUser for restricted scenarios
const newEntity = {
    name: "Test",
    user: testSetup.basicUser._id
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test notification-service.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Service vs Endpoint Tests

| Aspect | Service Tests | Endpoint Tests |
|--------|--------------|----------------|
| **Layer** | Business logic | HTTP API |
| **Method** | Direct method calls | HTTP requests via `inject()` |
| **Auth** | No authentication needed | Requires JWT tokens |
| **Setup** | Minimal (`TestSetup()`) | Requires routes & permissions |
| **Speed** | Faster | Slower (HTTP overhead) |
| **Focus** | Data operations | Request/response handling |

## Summary

When generating service tests for a new Drax CRUD entity:

1. **Create file:** `back/test/modules/{module}/{entity}/{entity}-service.test.ts`
2. **Import dependencies:** Vitest, ServiceFactory, Service class, TestSetup, interfaces
3. **Configure TestSetup:** Minimal setup (no routes/permissions needed)
4. **Get service instance:** From Factory in `beforeAll`
5. **Implement all 7 essential tests:** CRUD operations, pagination, search, filters, error handling
6. **Use Vitest:** `describe`, `it`, `beforeAll`, `afterAll`, `expect`
7. **Test directly:** Call service methods without HTTP layer
8. **Verify results:** Check return values and data persistence

This ensures comprehensive test coverage for the business logic layer of your Drax CRUD modules.
