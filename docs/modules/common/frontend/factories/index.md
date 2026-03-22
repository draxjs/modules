# Factories

## Propósito

Las factories crean y reutilizan instancias singleton de clientes HTTP.

## Piezas principales

- `HttpRestClientFactory` y `HttpGqlClientFactory` exponen instancias reutilizables por transporte.
- `HttpClientFactory.getInstance()` elige REST o GraphQL usando `VITE_HTTP_TRANSPORT`, con `REST` como valor por defecto.

## Cuándo usarlo

Es útil para centralizar la elección de transporte y evitar recrear clientes en cada vista o servicio.
