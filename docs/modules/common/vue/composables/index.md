# Composables

## Propósito

`composables` encapsula lógica reactiva reutilizable para UIs Drax.

## Piezas principales

- `useMenu()` resuelve texto traducido, estado activo, permisos y autenticación para `IMenuItem`.
- `useI18nValidation()` expone `$ta`, que traduce y concatena errores de validación.
- `useCopy()` copia texto al portapapeles con fallback para contextos inseguros.
- `useDateFormat()` devuelve `formatDateByUnit()` usando `IDraxDateFormatUnit`.

## Cuándo usarlo

Sirve cuando querés mover lógica repetitiva fuera de los componentes y mantener una API simple en composición.
