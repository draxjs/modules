# Buttons

## Propósito

La subcarpeta `buttons` agrupa acciones pequeñas reutilizables que el resto de los componentes CRUD usa dentro de toolbars, filas y diálogos.

## Piezas incluidas

- [CrudCreateButton](/modules/crud/vue/components/buttons/crud-create-button/)
- [CrudCreateOnTheFlyButton](/modules/crud/vue/components/buttons/crud-create-on-the-fly-button/)
- [CrudUpdateButton](/modules/crud/vue/components/buttons/crud-update-button/)
- [CrudDeleteButton](/modules/crud/vue/components/buttons/crud-delete-button/)
- [CrudViewButton](/modules/crud/vue/components/buttons/crud-view-button/)
- [CrudFilterButton](/modules/crud/vue/components/buttons/crud-filter-button/)
- [CrudColumnsButton](/modules/crud/vue/components/buttons/crud-columns-button/)
- [CrudExportButton](/modules/crud/vue/components/buttons/crud-export-button/)
- [CrudImportButton](/modules/crud/vue/components/buttons/crud-import-button/)
- [CrudGroupByButton](/modules/crud/vue/components/buttons/crud-group-by-button/)

## Diseño general

La mayoría de estos botones:

- usan tooltip con traducciones `action.*`
- aceptan atributos nativos vía `$attrs`
- no encapsulan permisos por completo; suelen depender de flags del padre para mostrarse o no

## Cuándo usarlo

Usá estos botones cuando quieras conservar el comportamiento y la semántica visual del CRUD sin volver a escribir íconos, tooltips o wiring repetitivo.
