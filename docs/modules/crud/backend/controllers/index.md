# Controllers

## Propósito

La carpeta expone la base HTTP para recursos CRUD sobre Fastify. Su responsabilidad no es persistir ni validar entidades directamente, sino traducir requests en llamadas al `service`, aplicar permisos RBAC, sumar filtros automáticos y devolver respuestas consistentes.

## Piezas principales

- `AbstractFastifyController<T, C, U>`: controlador base con operaciones CRUD, búsqueda, exportación y agrupación.

## Qué resuelve

- parseo de filtros serializados como `field;operator;value|...`
- enforcement de permisos sobre `Create`, `View`, `Update` y `Delete`
- filtros automáticos por tenant o usuario
- setters automáticos de tenant o usuario al crear
- asserts de ownership o tenant al leer, actualizar y borrar
- hooks `pre*` y `post*` para extender comportamiento
- emisión de eventos CRUD
- exportación de archivos a `files/exports/<year>/<month>`

## Página por elemento

- [AbstractFastifyController](/modules/crud/backend/controllers/abstract-fastify-controller/)

## Cuándo usarlo

Usalo como clase base para controladores concretos de entidades que necesiten endpoints completos con poco código adicional.
