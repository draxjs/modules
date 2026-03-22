# UserSessionMongoRepository

## Propósito

`UserSessionMongoRepository` implementa `IUserSessionRepository` sobre Mongo.

## Configuración

- `_model = UserSessionModel`
- `_searchFields = ['uuid', 'userAgent', 'ip']`
- `_populateFields = ['user']`
