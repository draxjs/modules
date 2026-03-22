# CrudRefDisplay

## Propósito

`CrudRefDisplay` convierte uno o varios IDs referenciados en un texto legible usando el provider de una entidad relacionada.

## Props

- `entity` (`IEntityCrud | undefined`, requerida)
- `value` (`any[]`, requerida en la definición actual, aunque el código también contempla un valor simple)
- `refDisplay` (`string`, requerida)

## Cómo funciona

- En `onMounted()` ejecuta `fetch()`.
- Si `entity.provider.find` existe, construye un filtro `_id in [ids]`.
- Guarda los registros cargados en `items`.
- El `computed display` concatena `item[refDisplay]` con comas.

## Observación

La implementación actual incluye un `console.log` en `onMounted`, por lo que este componente hoy genera ruido de debug en consola.

## Ejemplo

```vue
<CrudRefDisplay
  :entity="countryEntity"
  :value="form.countryIds"
  ref-display="name"
/>
```

## Cuándo usarlo

Usalo para mostrar refs ya resueltas en chips, resúmenes o listados de filtros activos.
