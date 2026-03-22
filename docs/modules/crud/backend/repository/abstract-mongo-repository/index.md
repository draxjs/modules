# AbstractMongoRepository

## Propósito

`AbstractMongoRepository<T, C, U>` implementa `IDraxCrud<T, C, U>` sobre Mongoose. Está pensado para repositorios concretos que trabajan con documentos Mongo y necesitan un set consistente de operaciones CRUD, búsqueda, paginación y agrupación.

## Estado protegido esperado

La clase se configura a través de propiedades protegidas:

- `_model`: modelo Mongoose que además implementa `PaginateModel<T>`
- `_searchFields`: campos usados por `search`, `paginate`, `find` y `findOne`
- `_populateFields`: lista de relaciones a poblar
- `_lean`: define si las lecturas usan objetos lean o documentos hidratados

## Métodos principales

- `assertId(id)`: valida que el id sea un `ObjectId` válido; si no, lanza `InvalidIdError`.
- `create(data)`: crea el documento, intenta poblar relaciones y traduce errores de Mongoose/Mongo.
- `update(id, data)`: actualiza con `findOneAndUpdate(..., { new: true })`.
- `updatePartial(id, data)`: hoy delega en la misma lógica que `update`.
- `delete(id)`: ejecuta `deleteOne` y devuelve `true` si `deletedCount == 1`.
- `findById(id)`: busca por id con `populate` y `lean`.
- `findByIds(ids, filters)`: combina `_id in [...]` con filtros adicionales.
- `findOneBy(field, value, filters)`: busca un único registro por campo.
- `findBy(field, value, limit, filters)`: busca varios registros por campo.
- `fetchAll()`: trae todos los documentos.
- `search(value, limit, filters)`: busca por `_id` o por regex sobre `_searchFields`.
- `paginate(options)`: usa `mongoose-paginate-v2`.
- `findOne(options)`: trae un único resultado por búsqueda/filtros.
- `find(options)`: devuelve una colección ordenada y opcionalmente limitada.
- `findCursor(options)`: expone un cursor Mongoose.
- `groupBy(options)`: ejecuta un pipeline de agregación dinámico.

## Manejo de errores

En `create`, `update` y `updatePartial` traduce explícitamente:

- `mongoose.Error.ValidationError`
- `mongoose.Error.CastError`
- `MongoServerError`

Las conversiones se hacen usando:

- `MongooseValidationErrorToValidationError`
- `MongooseCastErrorToValidationError`
- `MongoServerErrorToValidationError`

## Búsqueda y filtros

Los métodos de lectura construyen un `query` mutable y luego aplican:

- búsqueda por `_id` si el texto es un ObjectId válido
- búsqueda por regex `i` en `_searchFields` si el texto no es un id
- filtros extra mediante `MongooseQueryFilter.applyFilters(query, filters, this._model)`
- ordenamiento mediante `MongooseSort.applySort(...)`

## groupBy

`groupBy` es la parte más sofisticada de la clase.

### Qué detecta

- campos numéricos del schema: no agrupan, se suman con `$sum`
- campos `Date`: se agrupan según `dateFormat`
- campos con `ref`: arma `$lookup` y `$unwind` para devolver el objeto poblado
- campos simples: agrupa por valor directo

### dateFormat soportado

- `year`
- `month`
- `day`
- `hour`
- `minute`
- `second`

### Resultado

Devuelve objetos con:

- los campos agrupados ya proyectados
- `count`
- totales numéricos acumulados cuando el campo es numérico

## Particularidades visibles en código

- `create()` llama `item.populate(...)`, pero el retorno usa `this._lean ? item : item.toObject()`. Eso implica que con `_lean = true` devuelve el documento hidratado; con `_lean = false`, un objeto plano.
- `findCursor()` no reutiliza `_searchFields`; hoy, si hay `search`, filtra solo por `name`.
- `update()` y `updatePartial()` no chequean explícitamente si `findOneAndUpdate` devolvió `null`.

## Ejemplo de uso

```ts
import type { PaginateModel } from 'mongoose'
import AbstractMongoRepository from '@drax/crud-back/src/repository/AbstractMongoRepository'

class UserRepository extends AbstractMongoRepository<User, CreateUserDto, UpdateUserDto> {
  protected _model: PaginateModel<User> = UserModel as PaginateModel<User>
  protected _searchFields = ['name', 'email']
  protected _populateFields = ['role']
  protected _lean = true
}
```

## Cuándo usarlo

Conviene cuando la persistencia real está en MongoDB y la entidad necesita filtros dinámicos, relations vía `populate`, paginación y agrupaciones agregadas sin escribir pipelines por cada repositorio.
