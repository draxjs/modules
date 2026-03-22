# AbstractSqliteRepository

## Propósito

`AbstractSqliteRepository<T, C, U>` implementa `IDraxCrud<T, C, U>` sobre `better-sqlite3`. Está orientado a repositorios concretos que usan tablas SQLite y quieren una base común para CRUD, búsquedas, filtros y `groupBy`.

## Estado protegido esperado

La clase depende de varias propiedades protegidas que el repositorio concreto debe completar:

- `db`: conexión abierta a SQLite
- `dataBaseFile`: archivo físico de la base
- `tableName`: nombre de la tabla principal
- `searchFields`: campos usados en búsquedas por `LIKE`
- `booleanFields`: columnas que deben recastearse a boolean al leer
- `identifier`: clave primaria lógica; por defecto `_id`
- `populateFields`: relaciones manuales del tipo `{ field, table, identifier }`
- `tableFields`: definición estructural de columnas para el builder
- `verbose`: habilita logging del driver

## Constructor y bootstrap

- `constructor(dataBaseFile, verbose = false)`: abre la base y exige que exista `dataBaseFile`
- `build()`: invoca `SqliteTableBuilder` con `tableName`, `tableFields` e `identifier`

## Hooks de extensión

- `prepareData(data)`: hook previo a `INSERT` o `UPDATE`
- `prepareItem(item)`: hook posterior a lectura/decoración

La implementación base no modifica nada, pero ambos métodos están pensados para ser sobreescritos.

## Decoración de registros

Cada item leído puede pasar por tres etapas:

1. `execPopulate(item)`: carga manualmente relaciones mediante `SELECT * FROM <tabla relacionada>`
2. `castToBoolean(item)`: transforma `1` o `'true'` en `true`
3. `prepareItem(item)`: último paso de normalización/customización

La utilidad `decorate(item)` encapsula esa secuencia.

## Métodos principales

- `create(data)`: genera `randomUUID()` si falta el identificador, convierte booleanos, agrega timestamps si existen y luego inserta.
- `update(id, data)`: convierte booleanos, refresca `updatedAt` si corresponde y actualiza por `identifier`.
- `updatePartial(id, data)`: delega en `update`.
- `delete(id)`: elimina por `identifier`.
- `deleteAll()`: elimina toda la tabla.
- `paginate(options)`: arma `WHERE`, `COUNT`, `ORDER BY`, `LIMIT` y `OFFSET`.
- `find(options)`: consulta múltiple con search, filters y sort.
- `fetchAll()`: trae todos los registros.
- `search(value, limit, filters)`: busca por `LIKE` sobre `searchFields`.
- `findById(id)`: busca uno por `identifier`.
- `findByIds(ids, filters)`: busca varios ids.
- `findBy(field, value, limit, filters)`: busca varios por campo.
- `findOneBy(field, value, filters)`: busca uno por campo.
- `findOne(options)`: devuelve un único registro.
- `groupBy(options)`: arma un `SELECT ... COUNT(*) ... GROUP BY ...`.

## Timestamps automáticos

La clase detecta columnas especiales a través de:

- `hasCreatedAt()`
- `hasUpdatedAt()`

Si `tableFields` incluye esos nombres, `create()` y `update()` los completan con `new Date().toISOString()`.

## Search, filters y ordenamiento

Los métodos de lectura combinan:

- `searchFields` para búsquedas `LIKE`
- `SqlQueryFilter.applyFilters(where, filters)`
- `SqlSort.applySort(orderBy, order)`

## groupBy

La implementación SQL de `groupBy`:

- exige al menos un field
- detecta campos fecha si el `SqliteTableField` es `TEXT` y el nombre contiene `Date` o `date`
- detecta campos numéricos si el tipo es `INTEGER`, `REAL` o `NUMERIC`
- suma campos numéricos con `SUM(...)`
- agrupa fechas usando `strftime(...)` según `dateFormat`
- agrega `COUNT(*) as count`
- ordena siempre por `count DESC`

## Particularidades visibles en código

- `search(value, limit, filters)` recibe `filters` pero en la implementación actual no los aplica.
- `findByIds(ids, filters)` arma `WHERE ID IN (...)` con `ID` en mayúsculas y no con `this.identifier`.
- `findByIds(ids, filters)` inicializa `params` como `[ids]`, no como una expansión de ids individuales.
- `delete(id)` siempre devuelve `true`, sin verificar cuántas filas fueron afectadas.
- `create()` y `update()` convierten booleanos mutando el objeto `data` recibido.

## Ejemplo de uso

```ts
import AbstractSqliteRepository from '@drax/crud-back/src/repository/AbstractSqliteRepository'
import { SqliteTableField } from '@drax/common-back'

class SettingsRepository extends AbstractSqliteRepository<Setting, CreateSettingDto, UpdateSettingDto> {
  protected tableName = 'settings'
  protected identifier = '_id'
  protected searchFields = ['name', 'value']
  protected booleanFields = ['enabled']
  protected populateFields = []
  protected tableFields: SqliteTableField[] = [
    { name: '_id', type: 'TEXT', required: true },
    { name: 'name', type: 'TEXT', required: true },
    { name: 'enabled', type: 'INTEGER', required: false },
    { name: 'createdAt', type: 'TEXT', required: false },
    { name: 'updatedAt', type: 'TEXT', required: false },
  ]
}
```

## Cuándo usarlo

Usalo cuando la entidad vive en SQLite y necesitás una base simple pero consistente para CRUD genérico, con posibilidad de poblar relaciones manuales y normalizar datos antes o después de persistir.
