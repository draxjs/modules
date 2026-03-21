---
description: Generates a CRUD entity.
---

# Drax CRUD Generator Workflow

This workflow guides you through the process of creating a new CRUD entity in the Drax architecture. It is important to mention that Drax is a collection of reusable modules organized in a monorepo, where each module is located in its own directory inside the packages folder.

## Steps

1.  **Generate Entity Schema**
    Use the `drax-arch-generator` skill to generate the `IEntitySchema` and register it.

2.  **Review Entity Schema**
    **MANUAL STEP**: Review the generated schema file in `packages/zuite/zuite-arch/src/schemas`. Ensure the fields, types, and validations match the requirements. Modify the schema code directly if necessary.

3.  **Build Architecture**
    Generate the architectural files.
    Reference
    ```bash
    cd packages/zuite/zuite-arch
    npm run build
    ```
    *Verify that files are generated in `packages/zuite/zuite-arch/output`.*

4.  **Deploy Code**
    Copy the generated code to the frontend and backend directories target module.

5.  **Generate only Backend Tests**
    Use the `drax-crud-test-endpoints` skill to generate Vitest tests for the backend CRUD operations. Run the tests


