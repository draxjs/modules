# Interfaces

## Propósito

`interfaces` define contratos TypeScript consumidos por el resto del backend.

## Piezas principales

- `IDraxConfig`: mapa de configuración en memoria.
- `IQueryFilter`: estructura de filtros con `field`, `operator` y `value`.
- `ICacheAdapter<T>`: contrato para adapters de caché.
- `IError`: forma base de errores con `statusCode` y `body`.
- `IValidationFieldError`: error de validación por campo.
- `IUploadFile`, `IUploadFileResult`, `IUploadFileOptions`: contratos para uploads y restricciones.

## Cuándo usarlo

Sirve para tipar servicios reutilizables y mantener alineadas las implementaciones de caché, filtros y subida de archivos.
