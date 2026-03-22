# AuditProvider

## Propósito

`AuditProvider` expone el transporte REST del módulo sobre `AbstractCrudRestProvider`.

## Configuración

- base URL `/api/audits`
- singleton disponible en `AuditProvider.instance`
- tipado sobre `IAudit` e `IAuditBase`

## Cuándo usarlo

Usalo cuando necesites paginar, buscar, agrupar o exportar auditoría desde el frontend.
