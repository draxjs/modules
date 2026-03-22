# Controllers

## Propósito

La carpeta provee un controlador base para traducir excepciones del módulo a respuestas HTTP uniformes.

## Piezas principales

- `CommonController.handleError(e, reply)` reconoce errores propios como `ValidationError`, `NotFoundError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `MethodNotAllowedError`, `InvalidIdError`, `SecuritySensitiveError`, `UploadFileError` y `LimitError`.
- Cuando el error no es conocido, genera un `InternalServerError` y responde con estado `500`.

## Cuándo usarlo

Sirve para endpoints que quieran un punto único de salida ante fallos de validación, seguridad o infraestructura.
