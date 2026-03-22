# UserCrud

## Propósito

`UserCrud` define la entidad CRUD de usuarios.

## Qué hace

Configura refs a `RoleCrud` y `TenantCrud`, habilita exportación CSV, decide si mostrar tenant según entorno/permisos y limita edición/borrado según child roles del usuario autenticado.
