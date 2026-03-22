# SecuritySensitiveError

## Propósito

`SecuritySensitiveError` encapsula errores sensibles para no exponer demasiado detalle.

## Detalles

El código actual devuelve `statusCode` `200`, antepone `SecuritySensitiveError -` al mensaje y usa `error.security_sensitive_error` para i18n.
