# Templates

## Propósito

Los templates son funciones puras que reciben un `IEntitySchema` y devuelven código TypeScript o Vue como string.

## Organización

- `back`: genera piezas de backend compatibles con `@drax/crud-back`.
- `front`: genera providers, configuración CRUD, componentes y i18n.
- `share`: genera interfaces de entidad reutilizadas por back y front.
- `Template.ts`: base mínima para crear nuevas plantillas.

## Criterio de diseño

El contrato declarativo está en `IEntitySchema`; los templates transforman esa definición en artefactos concretos sin necesidad de mantener archivos a mano para cada entidad.
