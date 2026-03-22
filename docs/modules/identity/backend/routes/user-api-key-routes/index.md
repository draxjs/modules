# UserApiKeyRoutes

## Propósito

`UserApiKeyRoutes` registra las rutas HTTP de API keys de usuario.

## Qué registra

- `GET /api/user-api-keys`
- `POST /api/user-api-keys`
- `PUT /api/user-api-keys/:id`
- `DELETE /api/user-api-keys/:id`

## Particularidad

Cada ruta declara solo `tags: ['Identity']`; no usa `CrudSchemaBuilder`.
