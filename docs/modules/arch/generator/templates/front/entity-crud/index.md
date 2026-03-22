# EntityCrud

## Propósito

`TemplateEntityCrud` genera la clase central del frontend para una entidad.

## Qué concentra

- permisos CRUD
- headers visibles
- reglas de validación
- fields de formulario
- referencias a otras entidades
- tabs y menus declarados en el schema
- capacidades como exportar, agrupar, filtrar y seleccionar columnas

## Relación con los schemas

Esta plantilla es donde más se aprovecha `IEntitySchema`, porque traduce metadata de campos como `required`, `header`, `groupTab`, `groupMenu`, `enum`, `ref`, `hint` e íconos en comportamiento de UI.
