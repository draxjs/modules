# CrudSearch

## Propósito

`CrudSearch` es un input de búsqueda con debounce para no disparar paginación por cada tecla.

## v-model

- `modelValue`

## Cómo funciona

- Mantiene `input` local para no escribir directamente sobre el modelo externo.
- Sincroniza cambios externos mediante `watch`.
- Usa `debounce(updateModel, 500)`.
- Al limpiar, resetea inmediatamente el modelo.

## Ejemplo

```vue
<CrudSearch v-model="search" />
```

## Cuándo usarlo

Usalo cuando querés un search box consistente con el resto del CRUD y no querés reimplementar debounce manualmente.
