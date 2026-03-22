# ArchGenerator

## Propósito

`ArchGenerator` es la clase pública del módulo. Recibe una colección de `IEntitySchema` y un `outputPath`, y genera todos los artefactos necesarios para exponer una entidad Drax en backend y frontend.

## Qué hace

- Recorre cada entidad y ejecuta templates de `share`, `back` y `front`.
- Duplica la interfaz de la entidad tanto en `back/interfaces` como en `front/interfaces`.
- Agrupa entidades por `module` para generar `front/routes/index.ts` e `front/i18n/index.ts`.

## Salida por entidad

- Backend: repositorio tipado, schema Zod, modelo Mongo, permisos, repositorios Mongo y SQLite, servicio, factory, controller y rutas.
- Frontend: provider REST, definición `EntityCrud`, componente CRUD, combobox, página CRUD, ruta e i18n.

## Cuándo usarlo

Usalo en el paquete `arch` de un proyecto, como hace `packages/zuite/zuite-arch/src/index.ts`, cuando querés mantener la definición de entidades en un solo lugar y regenerar el código derivado.
