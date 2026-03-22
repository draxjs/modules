# UserApiKeyService

## Propósito

`UserApiKeyService` administra API keys de usuario y esconde el manejo del secreto real.

## Operaciones destacadas

- `create`
  - trim de `name`
  - genera UUID secreto
  - lee `DRAX_APIKEY_SECRET`
  - persiste solo el HMAC del secreto
  - devuelve el secreto plano solo en la respuesta
- `update`
  - trim de `name`
  - elimina `secret` del payload
- `delete`
- `findById`
- `findBySecret`
  - hashea el secreto recibido antes de consultar
- `paginate`

## Validación

Usa `UserApiKeyBaseSchema`.
