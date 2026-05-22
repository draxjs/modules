---
name: drax-ai-build-context-tool
description: Explica como funciona y como usar BuildContextTool en Drax AI para construir tools CRUD con contexto de usuario/tenant, filtros automaticos, setters de ownership, asserts de lectura/escritura y permisos All/ViewAll/UpdateAll/DeleteAll. Usar cuando el usuario pida documentacion, ejemplos o implementaciones de BuildContextTool, BuilderTool con contexto, tools AI para entidades, fromPromptContext, tenantFilter, userFilter, tenantSetter, userSetter, tenantAssert o userAssert.
---

# Drax AI BuildContextTool

Usar esta skill para explicar o implementar tools AI de entidades que necesitan respetar el contexto del usuario autenticado o de la sesion.

Fuentes principales:

- `packages/ai/ai-back/src/tools/BuildContextTool.ts`
- `packages/ai/ai-back/src/tools/BuilderTool.ts`
- `packages/ai/ai-back/src/interfaces/IBuilderTool.ts`
- `packages/ai/ai-back/test/BuildContextTool.test.ts`

## Idea central

`BuildContextTool` extiende `BuilderTool` y envuelve el `service` recibido para agregar reglas de contexto antes de que las tools ejecuten operaciones CRUD.

Debe explicarse asi:

- `BuilderTool` genera tools AI a partir de `entityName`, `schema`, `service` y `methods`.
- `BuildContextTool` mantiene esa API, pero intercepta metodos del service.
- En lecturas, puede agregar filtros `tenant` y `user`.
- En creacion, puede setear automaticamente `tenant` y `user`.
- En update/delete/findById/findByIds, puede validar que el item pertenece al tenant/user del contexto.
- En updates, si los setters estan activos, remueve campos de ownership del payload para evitar que el modelo cambie `tenant` o `user`.

## Entrada recomendada

Cuando ya existe un `DraxAgentPromptContext`, preferir `BuildContextTool.fromPromptContext(...)`.

```ts
import {BuildContextTool} from "@drax/ai-back";

const toolBuilder = BuildContextTool.fromPromptContext({
    entityName: "person",
    schema: PersonBaseSchema,
    service: PersonServiceFactory.instance,
    methods: ["create", "search", "paginate", "findById", "updatePartial"],
    tenantFilter: true,
    tenantSetter: true,
    tenantAssert: true,
    userSetter: true,
    userAssert: true,
}, promptContext);

const tools = toolBuilder.getTools();
const section = toolBuilder.getSystemPromptSection();
```

`fromPromptContext` toma:

- `userId` desde `promptContext.input?.userId` o `promptContext.session.userId`.
- `tenantId` desde `promptContext.input?.tenantId` o `promptContext.session.tenantId`.

Importante: `fromPromptContext` no carga permisos. Si el caso necesita reconocer `All`, `ViewAll`, `UpdateAll` o `DeleteAll`, instanciar `new BuildContextTool(...)` y pasar `context.permissions` o `context.hasSomePermission`.

Si no hay `DraxAgentPromptContext`, se puede instanciar directamente con `context`.

```ts
const toolBuilder = new BuildContextTool({
    entityName: "person",
    schema: PersonBaseSchema,
    service: PersonServiceFactory.instance,
    methods: ["search"],
    context: {
        userId: "user-1",
        tenantId: "tenant-1",
        permissions: ["person.view-all"],
    },
    permission: PersonPermissions,
    tenantFilter: true,
    userFilter: true,
});
```

## Opciones especificas

`BuildContextToolOptions` incluye todas las opciones de `ToolBuilderOptions` y agrega:

| Opcion | Default | Uso |
| --- | --- | --- |
| `context.userId` | `undefined` | Usuario actual para setters, filtros y asserts. |
| `context.tenantId` | `undefined` | Tenant actual para setters, filtros y asserts. |
| `context.permissions` | `undefined` | Lista simple de permisos del usuario. |
| `context.hasSomePermission` | `undefined` | Funcion para resolver permisos externamente. |
| `permission` | `undefined` | Mapa parcial `IDraxPermission` con `All`, `ViewAll`, `UpdateAll`, `DeleteAll`. |
| `tenantField` | `"tenant"` | Path del campo tenant. Soporta paths anidados como `"tenant._id"`. |
| `userField` | `"user"` | Path del campo user. Soporta paths anidados. |
| `tenantFilter` | `false` | Agrega filtro `tenantField eq tenantId` a lecturas listables. |
| `userFilter` | `false` | Agrega filtro `userField eq userId` a lecturas listables si no tiene `All` o `ViewAll`. |
| `tenantSetter` | `false` | Setea `tenantField` con `tenantId` en `create`; remueve ese campo en updates. |
| `userSetter` | `false` | Setea `userField` con `userId` en `create`; remueve ese campo en updates. |
| `tenantAssert` | `false` | Valida que el item leido/modificado pertenezca al tenant actual. |
| `userAssert` | `false` | Valida que el item leido/modificado pertenezca al usuario actual. |
| `defaultLimit` | `1000` | Limite usado cuando una tool de lectura no recibe limit. |

## Comportamiento por metodo

### Create

Si existen `service.create` y setters activos:

- clona superficialmente el payload;
- aplica `tenantSetter` y `userSetter`;
- ejecuta `service.create(payloadConContexto)`.

Ejemplo: con `tenantSetter: true`, `userSetter: true`, `tenantId: "tenant-1"` y `userId: "user-1"`, un payload `{fullname: "Ada"}` llega al service como:

```ts
{
    fullname: "Ada",
    tenant: "tenant-1",
    user: "user-1",
}
```

### Update y updatePartial

Antes de actualizar:

- carga el item actual con `service.findById(id)`;
- valida ownership con `assertWritable`;
- clona el payload;
- si `tenantSetter` o `userSetter` estan activos, elimina esos campos del payload;
- llama a `service.update` o `service.updatePartial`.

Esto evita que una tool AI cambie ownership aunque el modelo envie `tenant` o `user`.

### Delete

Antes de borrar:

- carga el item con `service.findById(id)`;
- valida ownership con `assertWritable`;
- llama a `service.delete(id)`.

### findById y findByIds

Despues de leer:

- `findById` llama `assertReadable(item)`.
- `findByIds` llama `assertReadable(item)` para cada item si el resultado es array.

Si el item no pertenece al contexto y el assert correspondiente esta activo, lanza `UnauthorizedError`.

### Lecturas listables

Los metodos `findOneBy`, `findOne`, `findBy`, `fetchAll`, `findFirst`, `findLast`, `search`, `find`, `paginate` y `groupBy` aplican filtros de lectura con `applyReadFilters`.

Reglas:

- si `tenantFilter` y hay `tenantId`, agrega `{field: tenantField, operator: "eq", value: tenantId}`;
- si `userFilter` y hay `userId`, agrega filtro de usuario salvo que tenga permiso `All` o `ViewAll`;
- conserva los filtros existentes y agrega los filtros de contexto al final;
- si `fetchAll` tiene filtros y el service expone `find`, usa `service.find(...)` con `limit: defaultLimit`; si no, usa `service.fetchAll()`.

## Permisos

`permission` solo declara los nombres de permisos que desbloquean reglas especiales. La autorizacion real sale de `context.hasSomePermission` o `context.permissions`.

Lectura:

- `permission.All` o `permission.ViewAll` omiten el assert/filtro de usuario.
- El tenant assert sigue aplicando si `tenantAssert` esta activo.

Escritura:

- `permission.All` omite assert de usuario en update/delete.
- `permission.UpdateAll` omite assert de usuario solo en update/updatePartial.
- `permission.DeleteAll` omite assert de usuario solo en delete.
- El tenant assert sigue aplicando si `tenantAssert` esta activo.

La resolucion usa primero `context.hasSomePermission(requiredPermissions)` si existe. Si no existe o retorna falsy, revisa `context.permissions`.

## Ownership y relaciones

Los asserts aceptan varios formatos de relacion:

```ts
{tenant: "tenant-1"}
{tenant: {_id: "tenant-1"}}
{tenant: {id: "tenant-1"}}
{tenant: someObjectId}
```

Internamente se resuelve el valor con el path configurado (`tenantField` o `userField`) y se convierte a string.

Si el campo esta vacio, `null` o `undefined`, no falla el assert. Solo falla cuando puede resolver un id y no coincide con el contexto.

## Errores esperados

Si se pide construir una tool para un metodo que el service no implementa, `getTools()` lanza:

```txt
Tool method not available on service: <method>
```

Si falla un assert de ownership, lanza `UnauthorizedError`.

## Patron recomendado

Para una entidad tenant-scoped creada por el usuario:

```ts
const builder = BuildContextTool.fromPromptContext({
    entityName: "customer",
    schema: CustomerBaseSchema,
    outputSchema: CustomerSchema,
    service: CustomerServiceFactory.instance,
    methods: ["create", "search", "paginate", "findById", "updatePartial", "delete"],
    tenantField: "tenant",
    userField: "user",
    tenantFilter: true,
    tenantSetter: true,
    tenantAssert: true,
    userSetter: true,
    userAssert: true,
}, promptContext);
```

Usar `userFilter: true` solo cuando las lecturas listables deben limitarse a registros del usuario y no solo al tenant. Para entidades compartidas por tenant, suele bastar `tenantFilter: true` + `tenantAssert: true`.

Si tambien se necesitan permisos `*All`, usar constructor directo:

```ts
const builder = new BuildContextTool({
    entityName: "customer",
    schema: CustomerBaseSchema,
    service: CustomerServiceFactory.instance,
    methods: ["search", "findById", "updatePartial", "delete"],
    context: {
        userId: promptContext.input?.userId ?? promptContext.session.userId ?? null,
        tenantId: promptContext.input?.tenantId ?? promptContext.session.tenantId ?? null,
        hasSomePermission: permissions => rbac.hasSomePermission(permissions),
    },
    permission: CustomerPermissions,
    tenantFilter: true,
    tenantAssert: true,
    userFilter: true,
    userAssert: true,
});
```

## Checklist al implementar

1. Confirmar que el `service` implementa todos los `methods` solicitados.
2. Usar `schema` para payloads de create/update y `outputSchema` si la respuesta tiene forma distinta.
3. Pasar `permission` cuando existan permisos `All`, `ViewAll`, `UpdateAll` o `DeleteAll`.
4. Activar `tenantFilter` para lecturas listables tenant-scoped.
5. Activar `tenantSetter` si el tenant debe venir siempre del contexto en create.
6. Activar `tenantAssert` para proteger findById/update/delete entre tenants.
7. Activar `userSetter` para campos tipo creador/owner.
8. Activar `userAssert` y/o `userFilter` solo si el ownership por usuario es parte de la regla de negocio.
9. Verificar con tests de tool execution, no solo con tests del service.

## No hacer

- No confiar en que el prompt impida cambiar `tenant` o `user`; usar setters/asserts.
- No activar `userFilter` en entidades compartidas por todo el tenant salvo que sea una regla explicita.
- No usar `fetchAll` para datos tenant-scoped si el service no implementa `find`; sin `find`, `fetchAll` no puede aplicar filtros.
- No duplicar wrappers de contexto alrededor del service; `BuildContextTool` ya crea el wrapper en el constructor.
