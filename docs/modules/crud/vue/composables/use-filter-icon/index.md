# useFilterIcon

## Propósito

`useFilterIcon()` devuelve el icono Vuetify apropiado para cada operador de filtro.

## Qué resuelve

Mapea operadores como `eq`, `ne`, `gt`, `lte`, `in` o `like` a íconos `mdi-*`.

## Piezas principales

- `filterIcon(field)`

## Cuándo usarlo

Usalo cuando quieras representar visualmente el operador activo de un filtro en chips, badges o formularios.

## Ejemplo

```ts
const { filterIcon } = useFilterIcon()

const icon = filterIcon.value({ operator: 'gte' } as any)
```
