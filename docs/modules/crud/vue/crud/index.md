# Crud

## Propósito

La carpeta documenta la base declarativa del módulo `crud-vue`. En el código fuente real, esta responsabilidad vive en `packages/crud/crud-vue/src/cruds/EntityCrud.ts`.

Aunque la carpeta solo contiene una clase, su peso es central: `EntityCrud` define el contrato que consumen los componentes, composables y stores para decidir qué mostrar, cómo validar, qué provider usar y cómo construir formularios, filtros y listados.

## Pieza principal

- `EntityCrud`: clase base que implementa `IEntityCrud` con defaults razonables y puntos de override.

## Qué resuelve

- metadata de headers y columnas
- definición de fields y filtros
- construcción automática de `form` y `formFilters`
- provider de lectura/escritura
- refs hacia otras entidades CRUD
- reglas y callbacks `onInput`
- flags de capacidad: create, update, delete, export, import, group by, filtros, columnas
- configuración visual de diálogo, tabla, toolbar, botones y variantes de input

## Páginas

- [EntityCrud](/modules/crud/vue/crud/entity-crud/)
- [Ejemplo de extensión](/modules/crud/vue/crud/entity-crud-example/)

## Cuándo usarlo

Usá esta sección cuando necesites entender cómo se modela una entidad CRUD en Drax Vue o cuando estés creando una clase concreta que extiende de `EntityCrud`.
