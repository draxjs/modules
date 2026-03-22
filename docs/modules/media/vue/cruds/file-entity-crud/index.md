# FileEntityCrud

## Propósito

`FileEntityCrud` describe cómo debe comportarse el recurso `File` dentro de `crud-vue`.

## Configuración relevante

- `name = 'File'`
- provider: `FileSystemFactory.getInstance()`
- `isViewable = true`
- `isEditable = false`
- `isCreatable = false`
- `isDeletable = true`
- `isExportable = true`
- `isGroupable = true`
- `searchEnable = true`
- `filtersEnable = true`
- `dynamicFiltersEnable = true`

## Qué define

- headers para metadata técnica y autoría
- fields readonly para datos del archivo y editables para descripción, tags, visibilidad y expiración
- headers exportables y columnas seleccionadas por defecto
