# UserApiKeySchema

## Propósito

`UserApiKeySchema` define los contratos Zod para API keys.

## Schemas

- `UserApiKeyBaseSchema`
  - `name`
  - `ipv4`
  - `ipv6`
- `UserApiKeySchema`
  - agrega `_id`, `id?`, `createdBy`

## Validaciones destacadas

- usa validadores `ipv4()` e `ipv6()` de Zod
