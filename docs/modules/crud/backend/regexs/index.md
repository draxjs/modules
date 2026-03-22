# Regexs

## Propósito

`regexs` concentra expresiones regulares utilitarias para validar querystrings del CRUD.

## Piezas principales

- `QueryFilterRegex`: valida el formato serializado de filtros como `field;operator;value|field;operator;value`.

## Cuándo usarlo

Sirve para rechazar filtros mal formados antes de intentar convertirlos a `IDraxFieldFilter[]`.
