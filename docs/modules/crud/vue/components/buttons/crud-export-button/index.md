# CrudExportButton

## Propósito

`CrudExportButton` abre el menú de formatos disponibles para exportar una entidad.

## Props

- `entity` (`IEntityCrud`, requerida)

## Evento

- `export`

El valor emitido es cada elemento de `entity.exportFormats`.

## Qué hace

- Solo renderiza si `entity.isExportable`.
- Usa `exportLoading` desde `useCrud(entity)` para deshabilitar y mostrar spinner.
- Muestra un `v-menu` con una opción por formato.

## Ejemplo

```vue
<CrudExportButton :entity="ordersEntity" @export="format => exportAs(format)" />
```
