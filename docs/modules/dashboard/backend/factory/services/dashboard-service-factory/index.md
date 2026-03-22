# DashboardServiceFactory

## Propósito

`DashboardServiceFactory` construye una única instancia de `DashboardService`.

## Cómo decide

- usa `DashboardMongoRepository` cuando `DbEngine` es `MONGODB`
- usa `DashboardSqliteRepository` y ejecuta `build()` cuando `DbEngine` es `SQLITE`
- toma el schema `DashboardBaseSchema`

## Resultado

Expone el servicio por `DashboardServiceFactory.instance` para controladores y otros consumidores internos.
