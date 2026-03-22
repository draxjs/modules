# AuditDashboard

## Propósito

`createAuditDashboard()` devuelve la configuración de un `IDashboardBase` para explorar auditoría por agrupaciones.

## Cards incluidas

- `User Entity Action`: tabla agrupada por `user`, `entity` y `action`
- `User Audits`: pie chart agrupado por `user`
- `Entity Audits`: pie chart agrupado por `entity`
- `Action Audits`: pie chart agrupado por `action`

## Detalles

- usa `AuditCrud.instance` como `entityInstance`
- fija `identifier = 'audit'`
- deja `filters` como arreglo inyectable desde el componente
