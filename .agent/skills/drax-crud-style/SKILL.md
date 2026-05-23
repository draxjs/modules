# drax-crud-style

Usa esta skill cuando necesites personalizar por CSS los componentes de `@drax/crud-vue`.
Los componentes exponen `id` y `class` sin estilos nuevos. Las clases son la API recomendada para temas reutilizables; los `id` sirven para overrides puntuales o para ubicar nodos concretos. Los ids con backticks en esta guia son patrones dinamicos de Vue.

## Convenciones

- `crud-*`: selector base de un componente o bloque.
- `crud-*__*`: elemento interno del bloque.
- `crud-*--*`: variante del bloque, por ejemplo el tipo de campo.
- Los ids dinamicos incluyen `entity.name`, `field.name`, `header.key`, `index`, `query._id` o valores equivalentes para distinguir elementos repetidos.
- No dependas de estilos internos de Vuetify cuando exista un selector `crud-*` equivalente.

## Componentes Principales

### Crud.vue

- `#crud-route-form-${entity.name}` / `.crud__route-form`: componente `CrudRouteForm` cuando el CRUD se abre desde la ruta.
- `#crud-container-${entity.name}` / `.crud`: `v-container` raiz del CRUD embebido.
- `#crud-card-${entity.name}` / `.crud__card`: tarjeta contenedora del listado.
- `#crud-list-component-${entity.name}` / `.crud__list`: componente dinamico de listado, tabla o galeria.
- `#crud-dialog-${entity.name}` / `.crud__dialog`: dialogo de formulario.
- `#crud-open-route-form-button` / `.crud__open-route-form-button`: boton para abrir el formulario en ruta.
- `#crud-dialog-prev-button` / `.crud__dialog-prev-button`: boton de navegacion al registro anterior.
- `#crud-dialog-next-button` / `.crud__dialog-next-button`: boton de navegacion al registro siguiente.
- `#crud-ai-toggle-button` / `.crud__ai-toggle-button`: boton que despliega la asistencia IA.
- `#crud-ai` / `.crud__ai`: panel de asistencia IA dentro del dialogo.
- `#crud-form-dialog` / `.crud__form`: formulario CRUD dentro del dialogo.
- `#crud-notify` / `.crud__notify`: snackbar de notificaciones.

### CrudRouteForm.vue

- `#crud-route-form-container-${entity.name}` / `.crud-route-form`: contenedor raiz del formulario por ruta.
- `#crud-route-form-card-${entity.name}` / `.crud-route-form__card`: tarjeta del formulario.
- `#crud-route-form-loading` / `.crud-route-form__loading`: barra de progreso.
- `#crud-route-form-actions` / `.crud-route-form__actions`: barra de acciones superior.
- `#crud-route-form-back-button` / `.crud-route-form__back-button`: boton volver.
- `#crud-route-form-form` / `.crud-route-form__form`: formulario interno.

### CrudDialog.vue

- `#crud-dialog` / `.crud-dialog`: `v-dialog` reutilizable.
- `#crud-dialog-card` / `.crud-dialog__card`: tarjeta interna.
- `#crud-dialog-toolbar` / `.crud-dialog__toolbar`: toolbar del dialogo.
- `#crud-dialog-title` / `.crud-dialog__title`: titulo del dialogo.
- `#crud-dialog-close-button` / `.crud-dialog__close-button`: boton cerrar.
- `#crud-dialog-content` / `.crud-dialog__content`: area de contenido.

### CrudNotify.vue

- `#crud-notify` / `.crud-notify`: snackbar de mensajes.
- `#crud-notify-close-button` / `.crud-notify__close-button`: boton cerrar notificacion.

## Listados

### CrudList.vue y CrudListTable.vue

`CrudList.vue` mantiene compatibilidad con el listado de tabla anterior. `CrudListTable.vue` es la tabla actual. Ambos exponen selectores equivalentes; en `CrudListTable` el prefijo de id es `crud-list-table-*`.

- `#crud-list-table-${entity.name}` / `.crud-list-table`: `v-data-table-server` principal.
- `#crud-list-table-pagination-error` / `.crud-list-table__pagination-error`: alerta de error de paginacion.
- `#crud-list-table-no-data` / `.crud-list-table__no-data`: alerta sin datos.
- `#crud-list-table-footer` / `.crud-list-table__footer`: footer de paginacion.
- `#crud-list-table-toolbar` / `.crud-list-table__toolbar`: toolbar superior.
- `#crud-list-table-title` / `.crud-list-table__title`: titulo del recurso.
- `#crud-list-table-saved-queries-button` / `.crud-list-table__saved-queries-button`: boton de consultas guardadas.
- `#crud-list-table-import-button` / `.crud-list-table__import-button`: boton importar.
- `#crud-list-table-export-button` / `.crud-list-table__export-button`: boton exportar.
- `#crud-list-table-group-by-button` / `.crud-list-table__group-by-button`: boton agrupar.
- `#crud-list-table-filter-button` / `.crud-list-table__filter-button`: boton filtros dinamicos.
- `#crud-list-table-columns-button` / `.crud-list-table__columns-button`: boton columnas.
- `#crud-list-table-refresh-button` / `.crud-list-table__refresh-button`: boton refrescar.
- `#crud-list-table-create-button` / `.crud-list-table__create-button`: boton crear.
- `#crud-list-table-export-list` / `.crud-list-table__export-list`: bloque con exportaciones.
- `#crud-list-table-import-list` / `.crud-list-table__import-list`: bloque con importaciones.
- `#crud-list-table-controls` / `.crud-list-table__controls`: tarjeta de busqueda y filtros.
- `#crud-list-table-search-section` / `.crud-list-table__search-section`: seccion de busqueda.
- `#crud-list-table-search` / `.crud-list-table__search`: componente de busqueda.
- `#crud-list-table-filters-section` / `.crud-list-table__filters-section`: seccion de filtros.
- `#crud-list-table-default-filters` / `.crud-list-table__default-filters`: filtros generados por defecto.
- `#crud-list-table-filters` / `.crud-list-table__filters`: filtros estaticos.
- `#crud-list-table-dynamic-filters` / `.crud-list-table__dynamic-filters`: filtros dinamicos.
- `#crud-list-table-filters-actions` / `.crud-list-table__filters-actions`: acciones aplicar/limpiar filtros.
- `#crud-list-table-toolbar-divider` / `.crud-list-table__toolbar-divider`: divisor bajo toolbar.
- `#crud-list-table-row-value-${header.key}` / `.crud-list-table__row-value`: valor de celda renderizado por `CrudRowValue`.
- `#crud-list-table-row-view-button-${index}` / `.crud-list-table__row-view-button`: accion ver en una fila.
- `#crud-list-table-row-update-button-${index}` / `.crud-list-table__row-update-button`: accion editar en una fila.
- `#crud-list-table-row-delete-button-${index}` / `.crud-list-table__row-delete-button`: accion eliminar en una fila.

### CrudListGallery.vue

- `#crud-list-gallery-${entity.name}` / `.crud-list-gallery`: contenedor raiz de galeria.
- `#crud-list-gallery-toolbar` / `.crud-list-gallery__toolbar`: toolbar superior.
- `#crud-list-gallery-title` / `.crud-list-gallery__title`: titulo del recurso.
- `#crud-list-gallery-toolbar-actions` / `.crud-list-gallery__toolbar-actions`: fila de acciones del toolbar.
- `#crud-list-gallery-import-button`, `#crud-list-gallery-export-button`, `#crud-list-gallery-group-by-button`, `#crud-list-gallery-filter-button`, `#crud-list-gallery-columns-button`, `#crud-list-gallery-saved-queries-button`, `#crud-list-gallery-refresh-button`, `#crud-list-gallery-create-button`: botones de toolbar. Sus clases son `.crud-list-gallery__import-button`, `.crud-list-gallery__export-button`, `.crud-list-gallery__group-by-button`, `.crud-list-gallery__filter-button`, `.crud-list-gallery__columns-button`, `.crud-list-gallery__saved-queries-button`, `.crud-list-gallery__refresh-button`, `.crud-list-gallery__create-button`.
- `#crud-list-gallery-export-list` / `.crud-list-gallery__export-list`: panel de exportaciones.
- `#crud-list-gallery-import-list` / `.crud-list-gallery__import-list`: panel de importaciones.
- `#crud-list-gallery-controls` / `.crud-list-gallery__controls`: tarjeta de busqueda y filtros.
- `#crud-list-gallery-search-section` / `.crud-list-gallery__search-section`: seccion de busqueda.
- `#crud-list-gallery-search` / `.crud-list-gallery__search`: campo de busqueda.
- `#crud-list-gallery-filters-section` / `.crud-list-gallery__filters-section`: seccion de filtros.
- `#crud-list-gallery-default-filters` / `.crud-list-gallery__default-filters`: contenedor de filtros por defecto.
- `#crud-list-gallery-filters` / `.crud-list-gallery__filters`: filtros estaticos.
- `#crud-list-gallery-dynamic-filters` / `.crud-list-gallery__dynamic-filters`: filtros dinamicos.
- `#crud-list-gallery-filters-actions` / `.crud-list-gallery__filters-actions`: acciones de filtros.
- `#crud-list-gallery-content` / `.crud-list-gallery__content`: contenedor de tarjetas.
- `#crud-list-gallery-loading-overlay` / `.crud-list-gallery__loading-overlay`: overlay de carga.
- `#crud-list-gallery-loading` / `.crud-list-gallery__loading`: indicador circular.
- `#crud-list-gallery-pagination-error` / `.crud-list-gallery__pagination-error`: alerta de error.
- `#crud-list-gallery-no-data` / `.crud-list-gallery__no-data`: alerta sin datos.
- `#crud-list-gallery-grid` / `.crud-list-gallery__grid`: grilla.
- `#crud-list-gallery-item-column-${index}` / `.crud-list-gallery__item-column`: columna de item.
- `#crud-list-gallery-item-card-${index}` / `.crud-list-gallery__item-card`: tarjeta del item.
- `#crud-list-gallery-item-fields-${index}` / `.crud-list-gallery__item-fields`: grilla de campos del item.
- `#crud-list-gallery-item-field-label-${index}-${header.key}` / `.crud-list-gallery__item-field-label`: etiqueta de campo.
- `#crud-list-gallery-item-field-value-${index}-${header.key}` / `.crud-list-gallery__item-field-value`: valor de campo.
- `#crud-list-gallery-item-actions-${index}` / `.crud-list-gallery__item-actions`: acciones de item.
- `#crud-list-gallery-item-view-button-${index}`, `#crud-list-gallery-item-update-button-${index}`, `#crud-list-gallery-item-delete-button-${index}`: botones ver, editar y eliminar; clases `.crud-list-gallery__item-view-button`, `.crud-list-gallery__item-update-button`, `.crud-list-gallery__item-delete-button`.
- `#crud-list-gallery-footer` / `.crud-list-gallery__footer`: pie de paginacion.
- `#crud-list-gallery-items-per-page` / `.crud-list-gallery__items-per-page`: selector de cantidad.
- `#crud-list-gallery-items-per-page-label` / `.crud-list-gallery__items-per-page-label`: label del selector.
- `#crud-list-gallery-items-per-page-select` / `.crud-list-gallery__items-per-page-select`: select de cantidad.
- `#crud-list-gallery-pagination` / `.crud-list-gallery__pagination`: paginador.

## Formularios

### CrudForm.vue

- `#crud-form` / `.crud-form`: `v-form` raiz.
- `#crud-form-card` / `.crud-form__card`: tarjeta del formulario.
- `#crud-form-id` / `.crud-form__id`: subtitulo con ID del registro.
- `#crud-form-error-content` / `.crud-form__error-content`: contenedor de error.
- `#crud-form-error-alert` / `.crud-form__error-alert`: alerta de error.
- `#crud-form-content` / `.crud-form__content`: cuerpo del formulario.
- `#crud-form-general-fields` / `.crud-form__general-fields`: fila de campos sin grupo.
- `#crud-form-general-field-column-${field.name}` / `.crud-form__general-field-column`: columna de campo general.
- `#crud-form-general-field-${field.name}` / `.crud-form__general-field`: componente de campo general.
- `#crud-form-tabs-card` / `.crud-form__tabs-card`: tarjeta de tabs.
- `#crud-form-tabs` / `.crud-form__tabs`: contenedor de tabs.
- `#crud-form-tab-${tab}` / `.crud-form__tab`: tab.
- `#crud-form-tab-label-${tab}` / `.crud-form__tab-label`: texto del tab.
- `#crud-form-tab-panel-${tab}` / `.crud-form__tab-panel`: panel de tab.
- `#crud-form-tab-field-column-${tab}-${field.name}` / `.crud-form__tab-field-column`: columna de campo en tab.
- `#crud-form-tab-field-${tab}-${field.name}` / `.crud-form__tab-field`: componente de campo en tab.
- `#crud-form-menu-layout` / `.crud-form__menu-layout`: layout de menus laterales.
- `#crud-form-menu-nav-column` / `.crud-form__menu-nav-column`: columna del menu.
- `#crud-form-menu-list` / `.crud-form__menu-list`: lista de menus.
- `#crud-form-menu-item-${menu}` / `.crud-form__menu-item`: item de menu.
- `#crud-form-menu-label-${menu}` / `.crud-form__menu-label`: texto del menu.
- `#crud-form-menu-fields-column` / `.crud-form__menu-fields-column`: columna de campos del menu.
- `#crud-form-menu-field-column-${menuSelected}-${field.name}` / `.crud-form__menu-field-column`: columna de campo.
- `#crud-form-menu-field-${menuSelected}-${field.name}` / `.crud-form__menu-field`: campo del menu.
- `#crud-form-actions` / `.crud-form__actions`: acciones inferiores.
- `#crud-form-cancel-button` / `.crud-form__cancel-button`: boton cancelar/cerrar.
- `#crud-form-submit-button` / `.crud-form__submit-button`: boton principal.
- `#crud-form-submit-and-return-button` / `.crud-form__submit-and-return-button`: boton guardar y volver.

### CrudFormField.vue

- `#crud-form-field-${name}` / `.crud-form-field`: wrapper raiz de campo.
- `.crud-form-field--${field.type}` normalizado con puntos como guiones: variante por tipo, por ejemplo `.crud-form-field--array-ref`.
- `#crud-form-field-string-${name}` / `.crud-form-field__string-input`: `v-text-field` string.
- `#crud-form-field-long-string-${name}` / `.crud-form-field__long-string-input`: textarea.
- `#crud-form-field-password-${name}` / `.crud-form-field__password-input`: password.
- `#crud-form-field-enum-combobox-${name}` / `.crud-form-field__enum-combobox`: enum con busqueda.
- `#crud-form-field-enum-select-${name}` / `.crud-form-field__enum-select`: enum sin busqueda.
- `#crud-form-field-select-${name}` / `.crud-form-field__select`: select con items.
- `#crud-form-field-select-item-${name}-${item.raw.value}` / `.crud-form-field__select-item`: opcion del select.
- `#crud-form-field-select-selection-${name}-${item.raw.value}` / `.crud-form-field__select-selection-chip`: chip seleccionado.
- `#crud-form-field-number-${name}` / `.crud-form-field__number-input`: campo numerico.
- `#crud-form-field-file-${name}` / `.crud-form-field__file-input`: media field.
- `#crud-form-field-full-file-${name}` / `.crud-form-field__full-file-input`: media full field.
- `#crud-form-field-boolean-${name}` / `.crud-form-field__boolean-switch`: switch booleano.
- `#crud-form-field-date-${name}` / `.crud-form-field__date-input`: date input.
- `#crud-form-field-date-end-of-day-${name}` / `.crud-form-field__end-of-day-chip`: chip 23:59.
- `#crud-form-field-ref-${name}` / `.crud-form-field__ref-autocomplete`: referencia.
- `#crud-form-field-array-ref-${name}` / `.crud-form-field__array-ref-autocomplete`: array de referencias.
- `#crud-form-field-array-string-${name}` / `.crud-form-field__array-string-combobox`: array de strings.
- `#crud-form-field-array-enum-${name}` / `.crud-form-field__array-enum-combobox`: array de enums.
- `#crud-form-field-array-number-${name}` / `.crud-form-field__array-number-combobox`: array numerico.
- `#crud-form-field-array-object-${name}` / `.crud-form-field__array-object-list`: lista de objetos.
- `#crud-form-field-record-${name}` / `.crud-form-field__record`: record key/value.
- `#crud-form-field-object-${name}` / `.crud-form-field__object-card`: tarjeta para objeto anidado.
- `#crud-form-field-object-title-${name}` / `.crud-form-field__object-title`: titulo de objeto.
- `#crud-form-field-object-field-${name}-${oField.name}` / `.crud-form-field__object-field`: campo anidado.

### CrudFormList.vue

- `#crud-form-list-${field.name}` / `.crud-form-list`: tarjeta raiz para arrays de objetos.
- `#crud-form-list-title-${field.name}` / `.crud-form-list__title`: titulo.
- Accordion: `#crud-form-list-accordion-${field.name}`, `#crud-form-list-accordion-item-${field.name}-${index}`, `#crud-form-list-accordion-field-${field.name}-${index}-${key}` con clases `.crud-form-list__accordion`, `.crud-form-list__accordion-item`, `.crud-form-list__field`.
- Chips: `#crud-form-list-chips-${field.name}`, `#crud-form-list-chip-group-${field.name}`, `#crud-form-list-chip-${field.name}-${index}`, `#crud-form-list-chips-field-${field.name}-${key}` con clases `.crud-form-list__chips`, `.crud-form-list__chip-group`, `.crud-form-list__chip`, `.crud-form-list__field`.
- Menu: `#crud-form-list-menu-${field.name}`, `#crud-form-list-menu-list-${field.name}`, `#crud-form-list-menu-item-${field.name}-${index}`, `#crud-form-list-menu-field-${field.name}-${key}` con clases `.crud-form-list__menu`, `.crud-form-list__menu-list`, `.crud-form-list__menu-item`, `.crud-form-list__field`.
- `.crud-form-list__add-button`, `.crud-form-list__remove-button`, `.crud-form-list__drag-icon`, `.crud-form-list__index-chip`: controles comunes.
- `.crud-form-list--drag-over`: estado durante drag and drop.

### CrudFormRecord.vue

- `#crud-form-record-${field.name}` / `.crud-form-record`: wrapper de record.
- `#crud-form-record-card-${field.name}` / `.crud-form-record__card`: tarjeta.
- `#crud-form-record-title-${field.name}` / `.crud-form-record__title`: titulo.
- `#crud-form-record-empty-${field.name}` / `.crud-form-record__empty`: estado sin datos.
- `#crud-form-record-entry-${field.name}-${entry.id}` / `.crud-form-record__entry`: fila key/value.
- `#crud-form-record-key-field-${field.name}-${entry.id}` / `.crud-form-record__key-field`: input key.
- `#crud-form-record-value-field-${field.name}-${entry.id}` / `.crud-form-record__value-field`: input value.
- `#crud-form-record-delete-button-${field.name}-${entry.id}` / `.crud-form-record__delete-button`: elimina entrada.
- `#crud-form-record-add-button-${field.name}` / `.crud-form-record__add-button`: agrega entrada.

## Campos, Filtros y Valores

### CrudAutocomplete.vue

- `#crud-autocomplete-select-${field.name}` / `.crud-autocomplete.crud-autocomplete--select`: select sin filtro.
- `#crud-autocomplete-input-${field.name}` / `.crud-autocomplete.crud-autocomplete--filterable`: autocomplete con busqueda.
- `#crud-autocomplete-create-${field.name}` / `.crud-autocomplete__create-button`: crear al vuelo.
- `#crud-autocomplete-item-${field.name}-${item.raw[itemValue]}` y `#crud-autocomplete-select-item-${field.name}-${item.raw[itemValue]}` / `.crud-autocomplete__item`: opcion.
- `#crud-autocomplete-selection-${field.name}-${item.raw[itemValue]}` y `#crud-autocomplete-select-selection-${field.name}-${item.raw[itemValue]}` / `.crud-autocomplete__selection-chip`: chip seleccionado.

### CrudFieldRange.vue

- `#crud-field-range-${name}` / `.crud-field-range`: fila de rango.
- `#crud-field-range-from-${name}` / `.crud-field-range__from-input`: fecha desde.
- `#crud-field-range-to-${name}` / `.crud-field-range__to-input`: fecha hasta.
- `#crud-field-range-end-of-day-${name}` / `.crud-field-range__end-of-day-chip`: chip 23:59.

### CrudFilters.vue

- `#crud-filters` / `.crud-filters`: tarjeta de filtros.
- `#crud-filters-row` / `.crud-filters__row`: fila de filtros.
- `#crud-filter-column-${filter.name}` / `.crud-filters__column`: columna de filtro.
- `#crud-filter-range-${filter.name}` / `.crud-filters__range-field`: filtro de rango.
- `#crud-filter-field-${filter.name}` / `.crud-filters__field`: filtro simple.

### CrudFiltersDynamic.vue

- `#crud-dynamic-filters` / `.crud-dynamic-filters`: fila raiz.
- `#crud-dynamic-filter-${index}` / `.crud-dynamic-filters__item`: filtro dinamico.
- `#crud-dynamic-filter-field-select-${index}` / `.crud-dynamic-filters__field-select`: selector de campo.
- `#crud-dynamic-filter-operator-select-${index}` / `.crud-dynamic-filters__operator-select`: selector de operador.
- `#crud-dynamic-filter-value-field-${index}` / `.crud-dynamic-filters__value-field`: valor del filtro.
- `#crud-dynamic-filter-delete-button-${index}` / `.crud-dynamic-filters__delete-button`: elimina filtro.
- `#crud-dynamic-filters-add-button` / `.crud-dynamic-filters__add-button`: agrega filtro.

### CrudFiltersAction.vue

- `#crud-filters-actions` / `.crud-filters-actions`: contenedor de acciones.
- `#crud-filters-clear-button` / `.crud-filters-actions__clear-button`: limpiar.
- `#crud-filters-apply-button` / `.crud-filters-actions__apply-button`: aplicar.

### CrudActiveFilters.vue

- `#crud-active-filters` / `.crud-active-filters`: tarjeta de filtros activos.
- `#crud-active-filters-list` / `.crud-active-filters__list`: lista de chips.
- `#crud-active-filters-label` / `.crud-active-filters__label`: etiqueta.
- `#crud-active-filter-${filter.index}` / `.crud-active-filters__chip`: chip activo.
- `.crud-active-filters__chip-label`, `.crud-active-filters__chip-icon`, `.crud-active-filters__chip-value`, `.crud-active-filters__chip-ref-value`: partes del chip.

### CrudSearch.vue

- `#crud-search-input` / `.crud-search-input`: campo de busqueda.

### CrudRowValue.vue

- `#crud-row-value-truncated` / `.crud-row-value--truncated`: valor truncado clickeable.
- `#crud-row-value-text` / `.crud-row-value--text`: valor normal.
- `#crud-row-value-dialog` / `.crud-row-value-dialog`: dialogo de texto completo.
- `#crud-row-value-dialog-title` / `.crud-row-value-dialog__title`: titulo.
- `#crud-row-value-dialog-text` / `.crud-row-value-dialog__text`: texto completo.
- `#crud-row-value-dialog-close-button` / `.crud-row-value-dialog__close-button`: cerrar.

### CrudRefDisplay.vue

- `#crud-ref-display-loading` / `.crud-ref-display--loading`: estado de carga.
- `#crud-ref-display-value` / `.crud-ref-display--value`: texto resuelto.

## Importacion y Exportacion

### CrudExportList.vue

- `#crud-export-list` / `.crud-export-list`: tarjeta de exportaciones.
- `#crud-export-list-title` / `.crud-export-list__title`: titulo.
- `#crud-export-list-error` / `.crud-export-list__error`: error.
- `#crud-export-list-table` / `.crud-export-list__table`: tabla.
- `#crud-export-list-row-${index}` / `.crud-export-list__row`: fila.
- `#crud-export-list-link-${index}` / `.crud-export-list__link`: link de descarga.
- `.crud-export-list__url-cell`, `.crud-export-list__row-count-cell`, `.crud-export-list__time-cell`: celdas.
- `#crud-export-list-actions` / `.crud-export-list__actions`: acciones.
- `#crud-export-list-clear-button` / `.crud-export-list__clear-button`: limpiar.
- `#crud-export-list-close-button` / `.crud-export-list__close-button`: cerrar.

### CrudImportList.vue

- `#crud-import-list` / `.crud-import-list`: tarjeta de importaciones.
- `#crud-import-list-title` / `.crud-import-list__title`: titulo.
- `#crud-import-list-error` / `.crud-import-list__error`: error.
- `#crud-import-list-table` / `.crud-import-list__table`: tabla.
- `#crud-import-list-row-${index}` / `.crud-import-list__row`: fila.
- `#crud-import-list-link-${index}` / `.crud-import-list__link`: link de reporte.
- `.crud-import-list__url-cell`, `.crud-import-list__row-count-cell`, `.crud-import-list__success-count-cell`, `.crud-import-list__error-count-cell`, `.crud-import-list__time-cell`: celdas.
- `#crud-import-list-actions` / `.crud-import-list__actions`: acciones.
- `#crud-import-list-clear-button` / `.crud-import-list__clear-button`: limpiar.
- `#crud-import-list-close-button` / `.crud-import-list__close-button`: cerrar.

## Botones y Menus

- `#crud-ai-button` / `.crud-ai-button`: boton IA; `#crud-ai-button-tooltip` / `.crud-ai-button__tooltip`.
- `#crud-create-button` / `.crud-create-button`: boton crear; `#crud-create-button-tooltip`.
- `#crud-create-on-the-fly-button` / `.crud-create-on-the-fly-button`: boton crear en autocomplete; `#crud-create-on-the-fly-dialog` / `.crud-create-on-the-fly-dialog`; `#crud-create-on-the-fly-form` / `.crud-create-on-the-fly-form`.
- `#crud-view-button` / `.crud-view-button`: boton ver.
- `#crud-update-button` / `.crud-update-button`: boton editar.
- `#crud-delete-button` / `.crud-delete-button`: boton eliminar.
- `#crud-refresh-button` / `.crud-refresh-button`: boton refrescar.
- `#crud-filter-button-wrapper` / `.crud-filter-button-wrapper`: wrapper de filtro dinamico; `#crud-filter-button` / `.crud-filter-button`.
- `#crud-import-button-wrapper` / `.crud-import-button-wrapper`: wrapper importar; `#crud-import-file-input` / `.crud-import-button__file-input`; `#crud-import-menu` / `.crud-import-menu`; `#crud-import-button` / `.crud-import-button`; `#crud-import-format-${format}` / `.crud-import-menu__item`.
- `#crud-export-menu` / `.crud-export-menu`; `#crud-export-button` / `.crud-export-button`; `#crud-export-format-${format}` / `.crud-export-menu__item`.
- `#crud-columns-menu` / `.crud-columns-menu`; `#crud-columns-button` / `.crud-columns-button`; `#crud-columns-list` / `.crud-columns-menu__list`; `#crud-columns-item-${column.key}` / `.crud-columns-menu__item`; `#crud-columns-checkbox-${column.key}` / `.crud-columns-menu__checkbox`.
- `#crud-saved-queries-menu` / `.crud-saved-queries-menu`; `#crud-saved-queries-button` / `.crud-saved-queries-button`; `#crud-saved-query-${query._id}` / `.crud-saved-queries-menu__query-item`; `#crud-saved-query-delete-${query._id}` / `.crud-saved-queries-menu__delete-button`.
- `#crud-saved-query-save-dialog` / `.crud-saved-query-save-dialog`: dialogo guardar consulta; incluye `#crud-saved-query-name-field`, `#crud-saved-query-shared-switch`, `#crud-saved-query-save-submit-button`.
- `#crud-saved-query-delete-dialog` / `.crud-saved-query-delete-dialog`: dialogo eliminar consulta; incluye `#crud-saved-query-delete-confirm-button`.
- `#crud-group-by-wrapper` / `.crud-group-by-wrapper`; `#crud-group-by-button` / `.crud-group-by-button`; `#crud-group-by-dialog` / `.crud-group-by-dialog`; `#crud-group-by-fields-select`, `#crud-group-by-date-format-select`, `#crud-group-by-apply-button`, `#crud-group-by-results-table`.

## IA

### CrudAi.vue

- `#crud-ai-panel-wrapper` / `.crud-ai-panel-wrapper`: wrapper expandible.
- `#crud-ai-panel` / `.crud-ai-panel`: tarjeta principal.
- `#crud-ai-header` / `.crud-ai-panel__header`: encabezado.
- `#crud-ai-subtitle` / `.crud-ai-panel__subtitle`: subtitulo.
- `#crud-ai-close-button` / `.crud-ai-panel__close-button`: cerrar.
- `#crud-ai-error` / `.crud-ai-panel__error`: error.
- `#crud-ai-empty-fields-warning` / `.crud-ai-panel__empty-fields-warning`: aviso sin campos.
- `#crud-ai-prompt` / `.crud-ai-panel__prompt`: textarea del prompt.
- `#crud-ai-generate-button` / `.crud-ai-panel__generate-button`: generar.
- `#crud-ai-preview` / `.crud-ai-panel__preview`: tarjeta de vista previa.
- `#crud-ai-response-message` / `.crud-ai-panel__response-message`: mensaje de respuesta.
- `#crud-ai-no-changes` / `.crud-ai-panel__no-changes`: alerta sin cambios.
- `#crud-ai-change-${entry.field.name}` / `.crud-ai-panel__change`: item de cambio.
- `.crud-ai-panel__current-value` y `.crud-ai-panel__suggested-value`: valores actual y sugerido.
- `#crud-ai-warning-${warning}` normalizado / `.crud-ai-panel__warning`: warning.
- `#crud-ai-actions` / `.crud-ai-panel__actions`: acciones.
- `#crud-ai-cancel-button` / `.crud-ai-panel__cancel-button`: cancelar.
- `#crud-ai-apply-button` / `.crud-ai-panel__apply-button`: aplicar sugerencias.

## Combobox de Entidades

### EntityCombobox.vue

- `#entity-combobox` / `.entity-combobox`: select de entidades.
- `#entity-combobox-item-${entity.name}` / `.entity-combobox__item`: opcion de entidad.
