# AuditServiceFactory

## Propósito

`AuditServiceFactory` arma una única instancia de `AuditService` con el repositorio correcto para el motor configurado.

## Cómo decide

- si `DraxConfig.getOrLoad(CommonConfig.DbEngine)` es `MONGODB`, usa `AuditMongoRepository`
- si es `SQLITE`, crea `AuditSqliteRepository`, ejecuta `build()` y usa el archivo definido en `CommonConfig.SqliteDbFile`
- en cualquier otro caso lanza error

## Salida

- inyecta `AuditBaseSchema` como schema de validación
- expone la instancia singleton mediante `AuditServiceFactory.instance`
