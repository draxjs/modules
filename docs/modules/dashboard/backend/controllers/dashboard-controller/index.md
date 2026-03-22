# DashboardController

## Propósito

`DashboardController` adapta `AbstractFastifyController` al dominio dashboard.

## Base

- hereda de `AbstractFastifyController<IDashboard, IDashboardBase, IDashboardBase>`
- usa `DashboardServiceFactory.instance`
- usa `DashboardPermissions`
- fija `tenantField = 'tenant'`
- fija `userField = 'user'`
- desactiva filtros, setters y asserts de tenant y user

## Rol en el módulo

No redefine operaciones; delega en la infraestructura CRUD estándar para crear, listar, actualizar y borrar dashboards.
