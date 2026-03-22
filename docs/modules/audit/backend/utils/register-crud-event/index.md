# RegisterCrudEvent

## Propósito

`RegisterCrudEvent` registra automáticamente una entrada de auditoría a partir de un evento CRUD.

## Qué hace

- calcula diferencias entre `preItem` y `postItem`
- ignora campos internos como `_id`, timestamps y metadatos de Mongoose
- compara referencias pobladas y `ObjectId`
- arma un `IAuditBase` con acción, entidad, usuario, tenant, API key, IP, sesión y request
- persiste el resultado con `AuditServiceFactory.instance.create(data)`

## Casos cubiertos

- creación: marca todos los campos nuevos
- eliminación: marca todos los campos removidos
- actualización: registra solo campos cuyo valor cambia
