# AbstractFastifyController

## Propósito

`AbstractFastifyController<T, C, U>` es la base HTTP del CRUD para Fastify. Conecta permisos, request parsing, hooks, filtros automáticos, exportación y emisión de eventos con un `AbstractService<T, C, U>`.

## Dependencias principales

- `service`: instancia de `AbstractService<T, C, U>`
- `permission`: objeto `IDraxPermission`
- `CrudEventEmitter`
- `IRbac` en `request.rbac`
- `CommonController` para `handleError`

## Configuración protegida

La clase se comporta según varias flags protegidas:

- `tenantField` / `userField`: nombres de campo; defaults `tenant` y `user`
- `tenantFilter`: agrega filtro por tenant en lecturas
- `tenantSetter`: escribe tenant al crear
- `tenantAssert`: valida pertenencia del item al tenant actual
- `userFilter`: agrega filtro por usuario en lecturas
- `userSetter`: escribe usuario al crear
- `userAssert`: valida ownership del item
- `defaultLimit`: default `1000`
- `maximumLimit`: default `10000`
- `baseFileDir`: raíz física para exportaciones
- `baseURL`: base usada para construir la URL pública del archivo exportado
- `entityName`: nombre usado en eventos

## Request modelado

El tipo `CustomRequest` define:

- `params`: `id`, `ids`, `format`, `field`, `value`
- `query`: `format`, `page`, `limit`, `orderBy`, `order`, `search`, `filters`, `headers`, `headersTranslate`, `separator`, `fileName`, `fields`, `dateFormat`

Además se extiende `FastifyRequest` para aceptar `rbac?: IRbac`.

## Filtros, tenant y usuario

### parseFilters(stringFilters)

Espera un formato tipo:

```text
field;operator;value|field;operator;value
```

Comportamiento:

- valida el string con `QueryFilterRegex`
- separa por `|`
- separa cada filtro por `;`
- admite filtros `empty` aun sin valor explícito
- devuelve `IDraxFieldFilter[]`

### applyUserAndTenantFilters(filters, rbac)

Combina:

- `applyTenantFilter`
- `applyUserFilter`

`applyUserFilter` no agrega filtro si el usuario tiene `permission.All` o `permission.ViewAll`.

### Setters y asserts

- `applyUserAndTenantSetters(payload, rbac)` escribe valores en el payload con `setNestedValue`
- `assertTenant(item, rbac)` valida tenant sobre item crudo o poblado
- `assertUser(item, rbac)` valida ownership sobre item crudo o poblado
- `assertUserAndTenant(item, rbac)` combina ambas validaciones

## Datos de auditoría

`extractRequestData(request)` arma un objeto con:

- usuario, rol, tenant, apiKey y sesión desde `rbac`
- `ip`
- `userAgent`
- `requestId`

Ese bloque se usa para construir eventos CRUD.

## Emisión de eventos

La clase emite cuatro eventos de alto nivel:

- `onCreated`
- `onUpdated`
- `onDeleted`
- `onExported`

Todos construyen un `IDraxCrudEvent` con:

- `action`
- `entity`
- `preItem`
- `postItem`
- `timestamp`
- `detail`
- metadata de request

## Hooks de extensión

La clase expone hooks asíncronos para sobreescribir:

- `preCreate`
- `postCreate`
- `preUpdate`
- `postUpdate`
- `preUpdatePartial`
- `postUpdatePartial`
- `preDelete`
- `postDelete`

La implementación base devuelve el mismo payload o item.

## Endpoints implementados

### Escritura

- `create`
  - exige `permission.Create`
  - aplica setters de user/tenant
  - ejecuta `preCreate`
  - crea vía `service.create`
  - emite `created`
  - ejecuta `postCreate`

- `update`
  - exige `permission.Update`
  - busca `preItem`
  - valida user/tenant si no tiene permisos globales
  - elimina del payload tenant/user cuando esos campos se gestionan automáticamente
  - ejecuta `service.update`
  - emite `updated`

- `updatePartial`
  - mismo flujo general que `update`, pero usa `service.updatePartial`

- `delete`
  - exige `permission.Delete`
  - recupera el item
  - valida asserts
  - ejecuta `service.delete`
  - emite `deleted`
  - responde con `id`, `message`, `deleted`, `deletedAt`

### Lectura

- `findById`
- `findByIds`
- `find`
- `findOne`
- `findBy`
- `findOneBy`
- `search`
- `paginate`
- `groupBy`

En general:

- exigen `permission.View`
- parsean filtros desde query cuando aplica
- agregan filtros automáticos de tenant/user
- delegan al service

## Export

`export`:

- exige `permission.View`
- acepta `format`, `headers`, `headersTranslate`, `separator`, `fileName`, `limit`, `orderBy`, `order`, `search`, `filters`
- genera destino físico `files/exports/<year>/<month>`
- llama `service.export(...)`
- construye una URL pública bajo `${baseURL}/api/file/exports/<year>/<month>/<fileName>`
- emite `exported`

## groupBy

`groupBy`:

- exige `permission.View`
- parsea `fields` desde una lista separada por comas
- acepta `dateFormat`
- falla con `BadRequestError` si no hay ningún field
- aplica filtros automáticos
- delega en `service.groupBy`

## Particularidades visibles en código

- En varios métodos, si faltan params obligatorios, se hace `reply.send(...)` pero no siempre hay `return` inmediato; la continuidad depende del flujo posterior.
- `findByIds` no aplica asserts por item; solo exige permiso `View`.
- `search` no parsea `request.query.filters`; solo aplica filtros automáticos de tenant/user.
- `find` usa `request.query.search ??= undefined`.
- `baseURL` elimina una barra final si existe.

## Ejemplo de uso

```ts
class UserController extends AbstractFastifyController<User, CreateUserDto, UpdateUserDto> {
  protected tenantFilter = true
  protected tenantSetter = true

  constructor(service: UserService, permission: IDraxPermission) {
    super(service, permission, 'User')
  }
}
```

## Cuándo usarlo

Usalo como clase base cuando tu entidad necesita un controlador CRUD Fastify completo con RBAC, filtros automáticos, exportación y eventos sin reimplementar cada endpoint.
