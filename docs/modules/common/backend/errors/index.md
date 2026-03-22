# Errors

## Propósito

`errors` define la base de errores del backend y una serie de adapters para convertir errores de librerías externas a un formato consistente para HTTP y GraphQL.

## Forma general del body

La mayoría de las clases implementan `IError` y exponen un `body` con esta estructura:

```json
{
  "statusCode": 400,
  "error": "BadRequestError",
  "message": "BadRequest",
  "i18nMessage": "error.bad_request"
}
```

`ValidationError` agrega además `inputErrors`, mientras que `ValidationFieldError` no define `body` porque representa un error interno por campo y no una respuesta HTTP completa.

## Errores principales

### `BadRequestError`

- `statusCode`: `400`
- Uso: errores de entrada inválida o parámetros mal formados.
- Constructor: acepta `message` e `i18nMessage`, por lo que es el error más flexible para devolver contexto específico.
- `body`:

```json
{
  "statusCode": 400,
  "error": "BadRequestError",
  "message": "BadRequest",
  "i18nMessage": "error.bad_request"
}
```

### `ForbiddenError`

- `statusCode`: `403`
- Uso: el usuario está autenticado pero no tiene permisos suficientes.
- Mensaje actual: `Forbidden. Insufficient permissions.`
- `body`:

```json
{
  "statusCode": 403,
  "error": "ForbiddenError",
  "message": "Forbidden. Insufficient permissions.",
  "i18nMessage": "error.forbidden"
}
```

### `UnauthorizedError`

- `statusCode`: `401`
- Uso: acceso sin autenticación válida.
- Ignora el mensaje pasado al constructor y devuelve siempre `Unauthorized`.
- `body`:

```json
{
  "statusCode": 401,
  "error": "UnauthorizedError",
  "message": "Unauthorized",
  "i18nMessage": "error.unauthorized"
}
```

### `NotFoundError`

- `statusCode`: `404`
- Uso: recurso inexistente o no localizable.
- Constructor: permite personalizar `message`.
- `body`:

```json
{
  "statusCode": 404,
  "error": "NotFoundError",
  "message": "Not found",
  "i18nMessage": "error.not_found"
}
```

### `MethodNotAllowedError`

- `statusCode`: `405`
- Uso: método HTTP no permitido para el recurso.
- Observación: el mensaje implementado hoy es `Forbidden. Insufficient permissions.`, aunque por semántica corresponde a un método no soportado.
- `body`:

```json
{
  "statusCode": 405,
  "error": "MethodNotAllowedError",
  "message": "Forbidden. Insufficient permissions.",
  "i18nMessage": "error.methodNotAllowed"
}
```

### `InternalServerError`

- `statusCode`: `500`
- Uso: fallback para errores no controlados.
- `CommonController` lo usa cuando recibe una excepción que no pertenece a la jerarquía conocida.
- `body`:

```json
{
  "statusCode": 500,
  "error": "InternalServerError",
  "message": "Internal Server Error. Please try again later.",
  "i18nMessage": "error.internal_server_error"
}
```

### `OperationFailError`

- `statusCode`: `500`
- Uso: fallos operativos genéricos cuando querés propagar un mensaje de negocio pero seguir indicando error del servidor.
- Observación: existe en `src/errors`, pero no está reexportado desde el `index.ts` del paquete.
- `body`:

```json
{
  "statusCode": 500,
  "error": "OperationFailError",
  "message": "OperationFailError",
  "i18nMessage": "error.operation_failed"
}
```

### `ValidationError`

- `statusCode`: `422`
- Uso: payload válido a nivel sintáctico, pero inválido a nivel de reglas de negocio o esquema.
- Construye un mensaje agregado con todos los campos fallidos.
- `body`:

```json
{
  "statusCode": 422,
  "error": "ValidationError",
  "message": "Validation error: field: reason",
  "i18nMessage": "error.validation_error",
  "inputErrors": [
    {
      "field": "email",
      "value": "bad-value",
      "reason": "validation.email"
    }
  ]
}
```

### `ValidationFieldError`

- `statusCode`: no aplica directamente.
- Uso: representa un error de validación puntual con `field`, `value` y `reason`.
- Se usa para construir `ValidationError.inputErrors`.

### `InvalidIdError`

- `statusCode`: `400`
- Uso: id inválido, por ejemplo un ObjectId mal formado.
- El mensaje incluye el id recibido.
- `body`:

```json
{
  "statusCode": 400,
  "error": "InvalidIdError",
  "message": "Invalid ID: <id>",
  "i18nMessage": "error.invalid_id"
}
```

### `LimitError`

- `statusCode`: `400`
- Uso: el valor actual supera un máximo permitido.
- El mensaje detalla `value` y `maximum`.
- `body`:

```json
{
  "statusCode": 400,
  "error": "LimitError",
  "message": "LimitError - Current value: 15 exceeds the maximum allowed value: 10",
  "i18nMessage": "error.limit_exceeded"
}
```

### `UniqueError`

- `statusCode`: `400`
- Uso: violación de unicidad a nivel de entidad/campo.
- Guarda `entity` y `field`, y el mensaje se construye a partir de esos datos.
- `body`:

```json
{
  "statusCode": 400,
  "error": "UniqueError",
  "message": "Unique constraint violation for field \"email\" on entity \"User\"",
  "i18nMessage": "error.unique"
}
```

### `UploadFileError`

- `statusCode`: `400`
- Uso: fallos al validar o persistir archivos subidos.
- Observación: aunque el constructor recibe `message`, la respuesta pública devuelve siempre `File upload failed`.
- `body`:

```json
{
  "statusCode": 400,
  "error": "UploadFileError",
  "message": "File upload failed",
  "i18nMessage": "error.upload_file_error"
}
```

### `SecuritySensitiveError`

- `statusCode`: `200`
- Uso: casos donde la implementación evita exponer detalles sensibles.
- Observación importante: el `statusCode` actual es `200`, no un código de error HTTP. La clase también redefine `message` de una forma atípica, por lo que conviene revisarla si se espera un comportamiento tradicional de excepción.
- `body` esperado según intención de la clase:

```json
{
  "statusCode": 200,
  "error": "SecuritySensitiveError",
  "message": "SecuritySensitiveError - <message>",
  "i18nMessage": "error.security_sensitive_error"
}
```

## Adapters

### `MongooseValidationErrorToValidationError`

Convierte un `mongoose.Error.ValidationError` en un `ValidationError` con un `inputErrors` por cada campo reportado por Mongoose.

### `MongooseCastErrorToValidationError`

Convierte un `mongoose.Error.CastError` en un `ValidationError` de un solo campo, usando `path`, `message` y `value`.

### `MongoServerErrorToValidationError`

Transforma un `MongoServerError` con `keyValue` en un `ValidationError`; la razón se arma como `validation.<codeName>`.

### `SqliteErrorToValidationError`

Detecta `SQLITE_CONSTRAINT_PRIMARYKEY` y `SQLITE_CONSTRAINT_UNIQUE` para devolver `ValidationError`; si el código no coincide, devuelve el error original.

### `ZodErrorToValidationError`

Mapea cada issue de Zod a `field`, `reason` y `value`, y lo envuelve en `ValidationError`.

### `ValidationErrorToGraphQLError`

Adapta un `ValidationError` a `GraphQLError` con `extensions.code = 'BAD_USER_INPUT'` y `extensions.inputErrors`.

## Cuándo usarlo

Usalo cuando quieras que controladores HTTP, resolvers GraphQL y capas de persistencia hablen el mismo lenguaje de errores y serialicen respuestas consistentes.
