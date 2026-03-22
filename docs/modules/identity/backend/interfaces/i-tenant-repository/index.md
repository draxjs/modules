# ITenantRepository

## Propósito

`ITenantRepository` define el contrato de persistencia de tenants.

## Extiende

- `IDraxCrudRepository<ITenant, ITenantBase, ITenantBase>`

## Métodos específicos

- `findById(id)`
- `findByName(name)`
- `fetchAll()`
