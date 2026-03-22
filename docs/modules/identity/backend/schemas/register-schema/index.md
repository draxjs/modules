# RegisterSchema

## Propósito

`RegisterSchema` modela el alta pública de usuario.

## Schemas

- `RegisterBodyRequestSchema`
  - `name`
  - `username`
  - `email`
  - `phone?`
  - `password`
- `RegisterBodyResponseSchema`
  - `success`
  - `message?`

## Validaciones destacadas

- `name` y `username` requeridos
- `email` válido
- `password` entre 8 y 64 caracteres
