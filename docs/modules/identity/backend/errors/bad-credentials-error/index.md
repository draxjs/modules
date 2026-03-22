# BadCredentialsError

## Propósito

`BadCredentialsError` representa el fallo de autenticación por credenciales inválidas.

## Comportamiento

- extiende `Error`
- implementa `IError`
- usa `message = 'error.badCredentials'`
- expone `statusCode = 401`

## Body de retorno

El getter `body` devuelve:

```json
{
  "statusCode": 401,
  "error": "BadCredentialsError",
  "message": "error.badCredentials",
  "i18nMessage": "error.badCredentials"
}
```

## Dónde se usa

- login por usuario y password en `UserService.auth`
- auth por email en `UserService.authByEmail`
- varios flows del `UserController`

## Cuándo usarlo

Conviene cuando querés responder 401 con un payload consistente e internacionalizable ante credenciales inválidas.
