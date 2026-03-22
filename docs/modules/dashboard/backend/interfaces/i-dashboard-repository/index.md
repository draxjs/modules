# IDashboardRepository

## Propósito

`IDashboardRepository` formaliza el contrato de persistencia del recurso dashboard.

## Base

- extiende `IDraxCrudRepository<IDashboard, IDashboardBase, IDashboardBase>`

## Implicancia

Las implementaciones deben soportar operaciones CRUD genéricas con payloads del dominio dashboard.
