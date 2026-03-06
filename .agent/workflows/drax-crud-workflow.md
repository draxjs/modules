---
description: Generates a complete CRUD module from a user story to full implementation with tests.
---

# Drax CRUD Generator Workflow

This workflow guides you through the process of creating a new CRUD entity in the Drax architecture, starting from a user story and ending with a fully tested implementation.

## Steps

1.  **Generate User Story**
    Use the `drax-crud-user-story` skill to generate an initial user story for your entity in specifications/crud.
    ```bash
    **MANUAL STEP**: Ask for the redmine ticket number
    - Use skill redmine-api to get ticket content
    - Use ticket description as a context of the user story
    # Example: Generate a story for a 'Product' entity in the 'inventory' module
    # prompt: "Generate a user story for a Product entity in the inventory module using the drax-crud-user-story skill."
    ```

2.  **Edit User Story**
    **MANUAL STEP**: The developer must review and edit the generated user story file to refine attributes, validations, and specific requirements. **Do not proceed until this is done.**

3.  **Generate Entity Schema**
    Once the user story is finalized, use the `drax-arch-generator` skill to generate the `IEntitySchema` and register it.
    ```bash
    # prompt: "Use the drax-arch-generator skill to generate the schema for [EntityName] based on the user story. Ensure it is added to arch/src/index.ts."
    ```

4.  **Review Entity Schema**
    **MANUAL STEP**: Review the generated schema file in `arch/src/schemas`. Ensure the fields, types, and validations match the requirements. Modify the schema code directly if necessary.

5.  **Build Architecture**
    Generate the architectural files.
    // turbo
    ```bash
    cd arch
    npm run build
    ```
    *Verify that files are generated in `arch/output`.*

6.  **Deploy Code**
    Copy the generated code to the frontend and backend directories.
    // turbo
    ```bash
    cd arch
    npm run copy:safe
    ```
    *Verify that files are copied to `back/src/modules` and `front/src/modules`.*


7.  **Setup permissions and routes on back**
    - Add entity permissions to back/src/setup/InitializePermissions.ts
    - Add entity route to back/src/factories/FastifyServerFactory.ts

8.  **Setup routes and i18n on front**
    - Add entity frontend routes to front/src/router/modules-routes.ts
    - Add entity i18n to front/src/i18n/modules-I18n.ts


9.  **Generate Backend Tests**
    Use the `drax-crud-test-endpoints` skill to generate Vitest tests for the backend CRUD operations.

10.  **No generate Frontend Tests**
    Avoid frontend Test

11.  **Add entity menu**
    Add entity menu in front/src/menu/index.ts
