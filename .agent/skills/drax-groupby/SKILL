---
name: drax-groupby
description: Cómo usar el endpoint group-by de Drax CRUD para construir dashboards de negocio, incluyendo parámetros, filtros, fechas, campos numéricos, referencias y limitaciones reales de la implementación.
---

# Drax GroupBy

Usa esta skill cuando la tarea consista en armar métricas, gráficos o cards agregadas sobre entidades CRUD de Drax.

Objetivo principal: **reutilizar `GET /group-by` y `provider.groupBy()` antes de proponer endpoints nuevos**.

## Qué resuelve

`groupBy` sirve para:

- contar registros por categoría
- agrupar por fechas con granularidad (`year`, `month`, `day`, etc.)
- sumar campos numéricos dentro de cada grupo
- agrupar por referencias Mongo y recibir el objeto poblado

No sirve bien para:

- detalle de registros
- paginación
- ordenar por otro campo que no sea `count`
- promedios, mínimos, máximos o percentiles
- combinaciones complejas de filtros OR desde el provider frontend actual

## Contrato del endpoint

- Backend: `GET /api/<entity>/group-by`
- Frontend: `provider.groupBy({ fields, filters, dateFormat })`

### Parámetros admitidos

- `fields: string[]`
  - Requerido.
  - En HTTP viaja como string separado por comas.
  - Ejemplo: `fields=createdAt,status`
  - Debe tener al menos 1 campo.
  - El schema de `GroupByQuerySchema` marca máximo 10 campos.
- `filters: IDraxFieldFilter[]`
  - Opcional.
  - En HTTP viaja serializado como `field;operator;value|field2;operator;value2`.
- `dateFormat: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'`
  - Opcional.
  - Default real: `day`.
  - Solo afecta a los campos fecha.

### Flujo real

1. El controller parsea `fields` desde querystring.
2. Si `fields` está vacío, responde error.
3. Parsea `filters`.
4. Aplica filtros automáticos de tenant/user si el controller los tiene habilitados.
5. Ejecuta `service.groupBy`.
6. El repository hace la agregación según el motor (`Mongo` o `SQLite`).

## Uso recomendado desde frontend

Siempre preferir el provider de la entidad.

```ts
const rows = await SalesOrderProvider.instance.groupBy({
  fields: ["createdAt", "status"],
  filters: [
    { field: "tenant", operator: "eq", value: tenantId },
    { field: "createdAt", operator: "gte", value: new Date("2026-01-01T00:00:00.000Z") }
  ],
  dateFormat: "month"
})
```

El provider arma:

- `fields` como `createdAt,status`
- `filters` como string
- `dateFormat` como query param

## Sintaxis real de filtros

Formato HTTP:

```txt
field;operator;value|field2;operator;value2
```

Formato tipado:

```ts
type IDraxFieldFilter = {
  field: string
  operator: string
  value: any
  orGroup?: string
}
```

### Operadores realmente soportados

Los operadores válidos en esta implementación son:

- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `nin`
- `like`
- `empty`

No asumir soporte de `regex` en `groupBy`: la implementación actual de parseo y validación no lo admite.

### Cómo serializa filtros el provider frontend

`AbstractBaseRestProvider.prepareFilters()`:

- descarta filtros cuyo `value` sea `null`, `undefined` o `''`, salvo operador `empty`
- convierte `Date` a `toISOString()`
- convierte arrays a string separado por comas
- serializa como `field;operator;value`

Limitación importante:

- el provider frontend actual **no serializa `orGroup`**
- el backend sí soporta `orGroup` en `parseFilters()` y `MongooseQueryFilter`
- por lo tanto, si la IA necesita OR reales entre filtros desde frontend, no debe asumir que `provider.groupBy()` lo resuelve hoy sin cambiar esa serialización

## Comportamiento con fechas

### Filtros de fecha

En Mongo:

- si el valor del filtro parece fecha ISO válida, se convierte a `Date`
- por eso conviene pasar fechas ISO o instancias `Date` desde frontend

Ejemplos:

```ts
filters: [
  { field: "createdAt", operator: "gte", value: new Date("2026-01-01T00:00:00.000Z") },
  { field: "createdAt", operator: "lt", value: new Date("2026-02-01T00:00:00.000Z") }
]
```

O en URL:

```txt
?fields=createdAt&filters=createdAt;gte;2026-01-01T00:00:00.000Z|createdAt;lt;2026-02-01T00:00:00.000Z&dateFormat=day
```

### Agrupación por fecha en Mongo

Si el campo en schema es `Date`, Mongo no agrupa por el timestamp exacto sino por un bucket según `dateFormat`.

Buckets:

- `year`: primer día del año
- `month`: primer día del mes
- `day`: fecha truncada al día
- `hour`: truncada a la hora
- `minute`: truncada al minuto
- `second`: truncada al segundo

Resultado:

- devuelve un valor fecha en el campo agrupado
- si el `groupBy` tiene un único campo fecha, el campo sale directamente desde `_id`
- si hay varios campos agrupados, cada fecha sale dentro de su propiedad correspondiente

Ejemplo esperado:

```ts
[
  { createdAt: new Date("2026-01-01T00:00:00.000Z"), count: 42 },
  { createdAt: new Date("2026-02-01T00:00:00.000Z"), count: 31 }
]
```

### Agrupación por fecha en SQLite

La detección de fecha es más débil que en Mongo:

- el campo debe existir en `tableFields`
- debe ser `TEXT`
- además el nombre debe contener `Date` o `date`

El valor devuelto en SQLite no es `Date`, sino string formateado por `strftime`:

- `year` -> `YYYY`
- `month` -> `YYYY-MM`
- `day` -> `YYYY-MM-DD`
- `hour` -> `YYYY-MM-DD HH:00:00`
- `minute` -> `YYYY-MM-DD HH:MM:00`
- `second` -> `YYYY-MM-DD HH:MM:SS`

Implicación:

- si la IA arma dashboards cross-backend, debe contemplar que Mongo devuelve fechas y SQLite strings

## Comportamiento con campos numéricos

### Regla principal

Un campo numérico en `fields` **no se usa como dimensión de agrupación**.

En cambio:

- se suma con `SUM` en SQLite
- se suma con `$sum` en Mongo

Esto es clave: si pasas `fields: ["amount"]`, no obtienes grupos por monto; obtienes el total acumulado de `amount`.

### Ejemplos correctos

Facturación por mes:

```ts
groupBy({
  fields: ["createdAt", "total"],
  dateFormat: "month"
})
```

Resultado esperado:

```ts
[
  { createdAt: new Date("2026-01-01T00:00:00.000Z"), total: 120000, count: 58 },
  { createdAt: new Date("2026-02-01T00:00:00.000Z"), total: 98000, count: 44 }
]
```

Pedidos por estado con suma de importe:

```ts
groupBy({
  fields: ["status", "total"]
})
```

Resultado esperado:

```ts
[
  { status: "paid", total: 84500, count: 120 },
  { status: "pending", total: 19000, count: 32 }
]
```

### Caso límite importante

Si todos los `fields` son numéricos:

- no hay dimensión de agrupación
- el grupo queda global
- el resultado normal es un único registro con `count` total y la suma de cada campo numérico

Ejemplo:

```ts
groupBy({
  fields: ["subtotal", "tax", "total"]
})
```

Resultado típico:

```ts
[
  { subtotal: 100000, tax: 21000, total: 121000, count: 350 }
]
```

## Comportamiento con referencias

### Mongo

Si un campo tiene `schemaPath.options.ref`:

- el agrupamiento se hace por el ObjectId referenciado
- luego se ejecuta `$lookup`
- el resultado final devuelve el objeto poblado en ese campo

Ejemplo:

```ts
groupBy({
  fields: ["seller", "total"]
})
```

Resultado esperado:

```ts
[
  {
    seller: { _id: "...", name: "Juan Perez", ... },
    total: 50000,
    count: 14
  }
]
```

### SQLite

No hay una resolución equivalente automática de referencias en `groupBy`.
No asumir populate de objetos completos salvo que exista una implementación concreta adicional.

## Orden del resultado

El resultado se ordena fijo por:

```txt
count DESC
```

No hay soporte estándar en `groupBy` para:

- `orderBy`
- `order`
- `limit`
- `page`

Si el dashboard necesita otro orden:

- ordenar en frontend si el volumen es razonable
- o crear un endpoint específico si la necesidad es estructural

## Ejemplos de dashboards de negocio

### 1. Ventas por mes

```ts
await InvoiceProvider.instance.groupBy({
  fields: ["createdAt", "total"],
  filters: [
    { field: "status", operator: "eq", value: "paid" }
  ],
  dateFormat: "month"
})
```

Lectura:

- `count`: cantidad de facturas
- `total`: facturación total del mes

### 2. Pedidos por estado

```ts
await OrderProvider.instance.groupBy({
  fields: ["status"]
})
```

Lectura:

- cada fila representa un estado
- `count` es la cantidad de pedidos

### 3. Facturación por vendedor

```ts
await OrderProvider.instance.groupBy({
  fields: ["seller", "total"],
  filters: [
    { field: "status", operator: "eq", value: "paid" }
  ]
})
```

Lectura:

- `seller`: vendedor agrupado
- `total`: monto vendido
- `count`: cantidad de operaciones

### 4. Evolución diaria de tickets abiertos

```ts
await TicketProvider.instance.groupBy({
  fields: ["createdAt"],
  filters: [
    { field: "status", operator: "in", value: ["open", "in_progress"] }
  ],
  dateFormat: "day"
})
```

## Reglas para decidir si usar `groupBy`

Usar `groupBy` si la pregunta del negocio es:

- cuántos hay por categoría
- cuánto se acumuló por período
- cuántas operaciones tuvo cada responsable
- cómo evoluciona un volumen en el tiempo

No usar `groupBy` si la pregunta es:

- cuáles son los últimos registros
- mostrar una tabla navegable
- ver detalle por documento
- calcular promedios o métricas derivadas no soportadas

## Limitaciones que la IA debe conocer

- `orGroup` existe en backend pero el provider frontend actual no lo envía.
- `dateFormat` es aceptado por controller y repository, pero `GroupByQuerySchema` hoy no lo declara explícitamente.
- El soporte de fechas en SQLite depende del nombre del campo, no solo del tipo.
- Un campo numérico en `fields` significa suma, no segmentación.
- El orden final siempre es por `count DESC`.
- No existe agregado estándar para `avg`, `min`, `max`.
- La respuesta es `Array<any>`, así que la forma exacta depende de los campos seleccionados y del motor usado.

## Qué debe hacer la IA al diseñar un dashboard

1. Identificar la dimensión principal del negocio:
   tiempo, estado, canal, vendedor, cliente, tenant.
2. Definir si la medida es:
   `count` sola o `count` + suma de uno o más numéricos.
3. Elegir `dateFormat` si la dimensión incluye fechas.
4. Aplicar filtros de negocio con la sintaxis real soportada.
5. Verificar si el caso necesita OR real entre filtros; si sí, no asumir que el provider actual lo resuelve.
6. Si `groupBy` no alcanza, proponer endpoint específico explicando por qué.

## Atajos prácticos

- Para series temporales: usar un campo fecha + `dateFormat`.
- Para cards KPI: usar solo campos numéricos si quieres un total global.
- Para gráficos por categoría: usar un string/reference como dimensión, y sumar numéricos si hace falta.
- Para dashboards comerciales: casi siempre combinar `count` con un campo monetario.
