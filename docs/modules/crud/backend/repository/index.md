# Repository

## Propósito

La carpeta define la base de persistencia reutilizable del módulo CRUD. En lugar de escribir desde cero `create`, `update`, `find`, `paginate`, `search` o `groupBy` para cada entidad, el módulo expone dos clases abstractas que implementan `IDraxCrud<T, C, U>` sobre motores distintos.

## Piezas principales

- `AbstractMongoRepository<T, C, U>`: implementación sobre Mongoose con soporte para `populate`, validación de ObjectId, filtros dinámicos y agregaciones con pipeline de Mongo.
- `AbstractSqliteRepository<T, C, U>`: implementación sobre `better-sqlite3` con creación de tablas, conversión de booleanos, decoración posterior de registros y agrupaciones por SQL.

## Qué resuelve la carpeta

- contrato CRUD homogéneo para repositorios concretos
- filtrado a partir de `IDraxFieldFilter[]`
- búsquedas por texto
- paginación
- búsquedas puntuales (`findById`, `findBy`, `findOneBy`, `findByIds`)
- agrupaciones (`groupBy`)
- puntos de extensión para adaptar datos antes y después de persistir

## Diferencias entre ambas implementaciones

- Mongo:
  - usa `_model` de Mongoose con `mongoose-paginate-v2`
  - soporta `populate` nativo
  - traduce errores de Mongoose/Mongo a errores de validación de `@drax/common-back`
  - valida IDs con `ObjectId.isValid`
- SQLite:
  - usa `better-sqlite3`
  - necesita definir `tableFields`, `tableName`, `identifier` y opcionalmente `populateFields`
  - convierte booleanos a `0/1` al persistir y los restaura al leer
  - permite bootstrap de tabla con `SqliteTableBuilder`

## Páginas por clase

- [AbstractMongoRepository](/modules/crud/backend/repository/abstract-mongo-repository/)
- [AbstractSqliteRepository](/modules/crud/backend/repository/abstract-sqlite-repository/)

## Cuándo usarlo

Usalo como base de repositorios concretos cuando una entidad necesita persistencia CRUD estándar y querés centralizar el comportamiento transversal de filtros, paginación, búsquedas y agrupaciones sin duplicar lógica en cada módulo.
