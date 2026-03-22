# CrudSchemaBuilder

## Propósito

`CrudSchemaBuilder` genera definiciones JSON Schema a partir de schemas Zod y las organiza en formatos reutilizables para endpoints CRUD.

Está pensado para evitar que cada controlador o registro de ruta tenga que reconstruir manualmente `params`, `query` y `response` para `find`, `paginate`, `create`, `update`, `delete`, `export` o `groupBy`.

## Constructor

```ts
new CrudSchemaBuilder(entitySchema, entityCreateSchema, entityUpdateSchema, entityName, target?, tags?)
```

### Parámetros

- `entitySchema`: schema completo de lectura
- `entityCreateSchema`: schema de creación
- `entityUpdateSchema`: schema de actualización
- `entityName`: nombre lógico de la entidad
- `target`: target de `z.toJSONSchema`, por defecto `openapi-3.0`
- `tags`: tags opcionales para documentación

## Adaptación interna de schemas

Antes de exponer los getters, el builder pasa los schemas por dos niveles de adaptación:

- `fieldAdapter(field)`
- `schemaAdapter(entitySchema)`

### fieldAdapter

`fieldAdapter` detecta algunos tipos concretos de Zod por nombre de constructor:

- `ZodOptional`: desenvuelve y vuelve a aplicar `.optional()`
- `ZodNullable`: desenvuelve y vuelve a aplicar `.nullable()`
- `ZodArray`: adapta recursivamente el elemento
- `ZodObject`: adapta recursivamente el shape
- `ZodDate`: lo convierte en `z.iso.datetime()`
- cualquier otro tipo: lo deja tal como está

El objetivo principal es que la salida JSON Schema sea serializable y amigable para OpenAPI.

## Getters JSON base

El builder expone primero piezas base:

- `jsonEntityCreateSchema`
- `jsonEntityUpdateSchema`
- `jsonEntitySchema`
- `jsonEntityArraySchema`
- `jsonEntityGroupBySchema`
- `jsonExportBodyResponse`
- `jsonErrorBodyResponse`
- `jsonValidationErrorBodyResponse`
- `jsonFindQuerySchema`
- `jsonGroupByQuerySchema`
- `jsonSearchQuerySchema`
- `jsonPaginateQuerySchema`
- `jsonDeleteBodyResponseSchema`
- `jsonFindByParamSchema`
- `jsonPaginateBodyResponseSchema`
- `jsonIdParamSchema`

## Getters de rutas CRUD

Sobre esas piezas base compone schemas más listos para Fastify:

- `exportSchema`
- `findByIdSchema`
- `findByIdsSchema`
- `searchSchema`
- `groupBySchema`
- `findSchema`
- `findOneSchema`
- `findBySchema`
- `findOneBySchema`
- `paginateSchema`
- `createSchema`
- `updateSchema`
- `deleteSchema`

Cada getter devuelve un objeto con:

- `tags` cuando fueron configurados
- `params` o `query` según corresponda
- `response` con códigos HTTP documentados

## Particularidades visibles en código

- `entityName` se guarda en la instancia pero en esta implementación no se usa para construir los getters.
- `findOneSchema` asigna `jsonFindQuerySchema` en `params`, no en `query`.
- `findByIdsSchema` define `ids` como un `string` separado por comas con una regex específica.
- `jsonEntityGroupBySchema` modela la respuesta como un array de objetos con `count` y `catchall(z.any())`, porque la forma final depende de los fields agrupados.

## Ejemplo de uso

```ts
const builder = new CrudSchemaBuilder(
  UserSchema,
  UserCreateSchema,
  UserUpdateSchema,
  'User',
  'openapi-3.0',
  ['Users']
)

const findByIdSchema = builder.findByIdSchema
const paginateSchema = builder.paginateSchema
```

## Cuándo usarlo

Usalo cuando quieras que tus rutas CRUD compartan contratos homogéneos y documentación OpenAPI consistente a partir de Zod.
