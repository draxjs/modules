# Common Frontend

## Propósito

`common-front` encapsula transporte HTTP, errores de cliente/servidor, helpers de interfaz y mensajes i18n reutilizables.

## Secciones

- `clients`: clientes REST y GraphQL basados en `fetch`.
- `errors`: errores normalizados para REST, GraphQL, red y fallos desconocidos.
- `factories`: singletons para elegir transporte REST o GraphQL.
- `helpers`: formateo de fechas y `debounce`.
- `i18n`: bundle de mensajes comunes.
- `interfaces`: contratos para clientes, headers y payloads de error.

## Cuándo usarlo

Sirve como capa base para UIs de Drax que necesiten una API homogénea de requests y una taxonomía de errores consistente entre vistas.
