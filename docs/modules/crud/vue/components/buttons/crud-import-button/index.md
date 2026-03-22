# CrudImportButton

## Propósito

`CrudImportButton` es el botón visual de importación.

## Props

- `entity` (`IEntityCrud`, requerida)

## Estado consumido

- Usa `exportLoading` desde `useCrud(entity)` para deshabilitarse. La implementación actual reutiliza ese estado también para import.

## Observación

Hoy el componente no emite ningún evento propio ni abre un flujo de importación por sí mismo; funciona más como placeholder visual cuando `entity.isImportable` es verdadero.

## Ejemplo

```vue
<CrudImportButton :entity="productEntity" />
```
