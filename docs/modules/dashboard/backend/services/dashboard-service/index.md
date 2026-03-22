# DashboardService

## Propósito

`DashboardService` envuelve `IDashboardRepository` y reutiliza la infraestructura CRUD genérica.

## Base

- hereda de `AbstractService<IDashboard, IDashboardBase, IDashboardBase>`
- recibe repositorio y schema Zod opcional

## Rol

Actúa como dependencia central de controller y factory, sin agregar reglas de negocio específicas en esta implementación.
