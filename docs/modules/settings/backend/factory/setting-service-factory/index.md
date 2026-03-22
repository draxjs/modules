# SettingServiceFactory

## Propósito

`SettingServiceFactory` crea la instancia singleton de `SettingService`.

## Cómo decide

- usa `SettingMongoRepository` con MongoDB
- usa `SettingSqliteRepository` y ejecuta `build()` con SQLite
- toma `DbEngine` y `SqliteDbFile` desde `DraxConfig`
