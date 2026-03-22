# RoleServiceFactory

## Propósito

`RoleServiceFactory` crea o reutiliza una instancia singleton de `RoleService`.

## Cómo decide la persistencia

Lee `CommonConfig.DbEngine` y:

- si es `MONGODB`, usa `RoleMongoRepository`
- si es `SQLITE`, usa `RoleSqliteRepository`, llama `build()` y luego crea el servicio

## Resultado

Devuelve siempre la misma instancia de `RoleService` una vez creada.
