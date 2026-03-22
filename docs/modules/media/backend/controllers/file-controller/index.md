# FileController

## Propósito

`FileController` adapta `AbstractFastifyController` al recurso `File`.

## Configuración

- usa `FileServiceFactory.instance`
- usa `FilePermissions`
- fija `tenantField = 'tenant'`
- fija `userField = 'createdBy.id'`
- activa filtros, setters y asserts de tenant y usuario

## Overrides

- `preUpdate()`: impide modificar `relativePath`, `absolutePath` y `filename`; además setea `updatedBy`
- `postDelete()`: borra el archivo físico mediante `StoreManager.deleteFilepath()`
