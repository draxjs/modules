# RoleService

## Propósito

`RoleService` concentra la lógica de negocio de roles sobre `AbstractService`.

## Operaciones destacadas

- `create`
  - valida con `RoleBaseSchema`
- `update`
  - impide modificar roles `readonly`
- `systemUpdate`
  - actualiza sin ese bloqueo
- `delete`
  - impide borrar roles `readonly`
- `systemDelete`
  - borra sin ese bloqueo
- `findById`
- `findByName`
- `fetchAll`
- `search`
- `paginate`

## Cuándo usarlo

Conviene cuando necesitás proteger roles del sistema y a la vez exponer flows administrativos normales.
