# Interfaces

## Propósito

`interfaces` define los contratos de clientes y errores usados por `common-front`.

## Piezas principales

- `IHttpClient`, `IHttpOptions` e `IHttpHeader` para clientes REST.
- `IGqlClient` e `IGqlOptions` para GraphQL.
- `IRestError` e `IGqlError` para serializar fallos.
- `IInputError` y `IClientInputError` para errores de validación presentables en UI.

## Cuándo usarlo

Sirve para tipar servicios y componentes sin acoplarlos a una implementación concreta de cliente.
