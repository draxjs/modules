# Helpers

## Propósito

`helpers` resuelve utilidades pequeñas orientadas a interfaz y consumo de datos.

## Piezas principales

- `formatDate(isoDate, locale?)` devuelve fecha localizada.
- `formatDateTime(isoDate, locale?)` hace lo mismo incluyendo hora.
- `debounce(fn, delay)` posterga la ejecución de una función para reducir ruido en inputs o búsquedas.

## Cuándo usarlo

Conviene en componentes o stores que necesiten presentar fechas o controlar frecuencia de eventos.
