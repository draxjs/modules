# IRoleRepository

## Propósito

`IRoleRepository` define el contrato de persistencia de roles.

## Extiende

- `IDraxCrudRepository<IRole, IRoleBase, IRoleBase>`

## Métodos específicos

- `findById(id)`
- `findByName(name)`
- `fetchAll()`

## Cuándo usarlo

Usalo como contrato para repositorios Mongo o SQLite de roles.
