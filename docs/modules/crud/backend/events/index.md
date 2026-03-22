# Events

## Propósito

`events` centraliza la emisión de eventos CRUD para auditoría, métricas o integraciones que reaccionan después de operaciones de negocio.

## Piezas principales

- `CrudEventEmitter`: singleton basado en `EventEmitter` que publica el canal `crud:event`.

## Qué resuelve

- un punto único de publicación de eventos CRUD
- compatibilidad con múltiples listeners dentro del proceso
- encapsulación del nombre del evento emitido

## Página por elemento

- [CrudEventEmitter](/modules/crud/backend/events/crud-event-emitter/)

## Cuándo usarlo

Conviene cuando un CRUD necesita disparar auditoría, métricas o integraciones después de una operación.
