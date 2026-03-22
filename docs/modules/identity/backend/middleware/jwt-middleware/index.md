# jwtMiddleware

## Propósito

`jwtMiddleware` extrae y valida el JWT del request.

## Qué hace

- busca `Authorization: Bearer <token>`
- ignora explícitamente `/api/auth/login`
- si hay token, llama `AuthUtils.verifyToken`
- si valida, setea:
  - `request.authUser`
  - `request.token`

## Manejo de error

- `TokenExpiredError` -> responde `498`
- otros errores -> responde `401`

## Cuándo usarlo

Usalo como middleware temprano cuando las rutas necesitan exponer `authUser` al resto del pipeline.
