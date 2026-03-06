---
description: Crear dashboards Drax en Vue usando IDashboardBase, DashboardView y cards paginate/groupBy
---

# Drax Framework - Dashboard Generator Guide

## Objetivo
Esta skill guía a un agente IA para crear dashboards Drax reutilizando la infraestructura existente del framework.

El agente debe generar dashboards compatibles con:

- `@drax/dashboard-share`
- `@drax/dashboard-vue`
- entidades CRUD registradas en Drax
- vistas Vue que usen `DashboardView`
- definición declarativa mediante `IDashboardBase`

Esta skill sirve para crear:

1. archivos de definición de dashboard (`[Name]Dashboard.ts`)
2. componentes Vue para renderizar dashboards (`[Name]Dashboard.vue`)
3. filtros reactivos compartidos entre cards
4. configuraciones `groupBy` y `paginate`
5. dashboards por módulo, entidad o caso de uso

---

## Arquitectura esperada

### Definición del dashboard
Un dashboard Drax se define con un objeto `IDashboardBase`:
```
typescript
import type {IDashboardBase} from "@drax/dashboard-share";

const exampleDashboard: IDashboardBase = {
identifier: "example",
title: "Example Dashboard",
cards: []
}

export {exampleDashboard}
export default exampleDashboard
```
### Renderizado del dashboard
La vista Vue debe usar `DashboardView` desde `@drax/dashboard-vue`:
```
vue
<script setup lang="ts">
import {ref} from "vue"
import {DashboardView} from "@drax/dashboard-vue"
import type {IDashboardBase} from "@drax/dashboard-share"
import exampleDashboard from "../dashboards/ExampleDashboard"

const dashboard = ref<IDashboardBase>(exampleDashboard)
</script>

<template>
  <dashboard-view :dashboard="dashboard" />
</template>
```
---

## Ubicación de archivos

Como convención, para un módulo `sales` y un dashboard `SalesDashboard`:
```
text
packages/<module>/<module>-vue/src/
├── components/
│   └── SalesDashboard.vue
├── dashboards/
│   └── SalesDashboard.ts
```
### Reglas de naming
- Dashboard en PascalCase: `SalesDashboard`
- Archivo TS: `SalesDashboard.ts`
- Componente Vue: `SalesDashboard.vue`
- `identifier`: string corto, estable y en minúsculas, por ejemplo `sales`
- `title`: nombre visible del dashboard

---

## Contrato del dashboard

## `IDashboardBase`
```
typescript
interface IDashboardBase {
  identifier: string
  title: string
  cards?: Array<IDashboardCard>
  createdAt?: Date
  updatedAt?: Date
}
```
## `IDashboardCard`
```
typescript
interface IDashboardCard {
  entity: string
  entityInstance?: IEntityCrud
  type: "paginate" | "groupBy"
  title: string
  filters?: Array<{
    field: string
    operator: string
    value: any
  }>
  layout?: {
    cols: number
    sm: number
    md: number
    lg: number
    height: number
    cardVariant: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain" | undefined
  }
  groupBy?: {
    fields: Array<string>
    dateFormat?: "year" | "month" | "day" | "hour" | "minute" | "second"
    render?: string
  }
  paginate?: {
    columns: Array<string>
    orderBy?: string
    order?: string
  }
}
```
---

## Tipos de cards soportadas

## 1. `groupBy`
Se usa para agrupar registros por uno o más campos.

### Ejemplo
```
typescript
{
  entity: "Audit",
  type: "groupBy",
  entityInstance: AuditCrud.instance,
  title: "Action Audits",
  filters: [],
  layout: {
    cols: 12,
    sm: 12,
    md: 4,
    lg: 4,
    cardVariant: "outlined",
    height: 400
  },
  groupBy: {
    fields: ["action"],
    dateFormat: "day",
    render: "pie"
  }
}
```
### Render disponibles
- `table`
- `gallery`
- `pie`
- `bars`

### Cuándo usarlo
- métricas resumidas
- distribución por estado, usuario, entidad, acción, categoría
- cortes por tiempo si aplica `dateFormat`

---

## 2. `paginate`
Se usa para listar registros paginados.

### Ejemplo
```
typescript
{
  entity: "Audit",
  type: "paginate",
  entityInstance: AuditCrud.instance,
  title: "Latest Audits",
  filters: [],
  layout: {
    cols: 12,
    sm: 12,
    md: 12,
    lg: 12,
    cardVariant: "outlined",
    height: 400
  },
  paginate: {
    columns: ["user", "entity", "action", "createdAt"],
    orderBy: "createdAt",
    order: "desc"
  }
}
```
### Cuándo usarlo
- últimas actividades
- listados detallados
- vistas operativas con columnas visibles

---

## Uso de `entity` y `entityInstance`

Cada card debe definir:

- `entity`: nombre de la entidad, por ejemplo `"Audit"`
- `entityInstance`: recomendado cuando el CRUD está disponible directamente

### Regla
**Preferir siempre `entityInstance` cuando el CRUD del módulo está disponible**, para evitar dependencia implícita del store global de entidades.

### Ejemplo
```
typescript
import AuditCrud from "../cruds/AuditCrud";

{
  entity: "Audit",
  entityInstance: AuditCrud.instance,
  type: "groupBy",
  title: "User Audits"
}
```
---

## Filtros

Las cards aceptan filtros con la forma:
```
typescript
{
  field: string,
  operator: string,
  value: any
}
```
### Ejemplo
```
typescript
[
  {field: "createdAt", operator: "gte", value: fromDate},
  {field: "createdAt", operator: "lte", value: toDate}
]
```
### Operadores comunes
- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `like`
- `in`

### Regla importante
Si varias cards comparten el mismo rango o contexto, el componente Vue debe crear un `ref` común y asignarlo a todas las cards para mantener sincronía.

---

## Patrón recomendado para filtros compartidos

Cuando el dashboard necesita filtros globales, por ejemplo rango de fechas, usar este patrón:
```
vue
<script setup lang="ts">
import {ref} from "vue"
import {DashboardView} from "@drax/dashboard-vue"
import type {IDashboardBase, IDashboardCard} from "@drax/dashboard-share"
import dashboardDefinition from "../dashboards/MyDashboard"

const today = new Date()
const start = new Date(today.getFullYear(), today.getMonth(), 1)

const filters = ref([
  {field: "createdAt", operator: "gte", value: start},
  {field: "createdAt", operator: "lte", value: today},
])

const dashboard = ref<IDashboardBase>(dashboardDefinition)

dashboard.value.cards?.forEach((card: IDashboardCard) => {
  card.filters = filters.value
})
</script>

<template>
  <dashboard-view :dashboard="dashboard" />
</template>
```
### Regla
Si el dashboard tiene filtros globales:
- crear `ref([...])`
- asignarlo a cada card
- exponer controles UI para modificarlos

---

## Layout de cards

Cada card debe definir `layout` cuando se quiere controlar presentación responsive.

### Convención recomendada
```
typescript
layout: {
  cols: 12,
  sm: 12,
  md: 4,
  lg: 4,
  cardVariant: "outlined",
  height: 400
}
```
### Recomendaciones
- tablas anchas: `md: 12, lg: 12`
- resúmenes tipo pie/bars: `md: 4, lg: 4`
- usar `height` consistente entre cards hermanas
- `cardVariant: "outlined"` como default visual seguro

---

## Reglas de generación

Cuando el usuario pida crear un dashboard Drax, el agente debe:

1. identificar el módulo destino
2. identificar la entidad principal
3. ubicar o inferir el CRUD correspondiente
4. crear el archivo `src/dashboards/[Name]Dashboard.ts`
5. crear el archivo `src/components/[Name]Dashboard.vue`
6. usar `IDashboardBase`
7. usar `DashboardView`
8. incluir `entityInstance` cuando exista el CRUD
9. usar `groupBy` para agregaciones
10. usar `paginate` para listados
11. agregar filtros compartidos si el caso de uso lo requiere
12. mantener nombres de campos compatibles con la entidad real

---

## Checklist de calidad

Antes de dar por terminado un dashboard, validar:

- `identifier` único y estable
- `title` claro para usuario final
- todas las cards tienen `entity`
- todas las cards tienen `type`
- las cards `groupBy` tienen `groupBy.fields`
- las cards `paginate` tienen `paginate.columns`
- el `layout` es responsive
- los filtros tienen `field`, `operator`, `value`
- se usa `entityInstance` si existe el CRUD
- el componente Vue renderiza `DashboardView`
- los controles de filtro actualizan la misma referencia compartida

---

## Plantilla base: archivo de dashboard
```
typescript
import type {IDashboardBase} from "@drax/dashboard-share";
import SomeEntityCrud from "../cruds/SomeEntityCrud";

const someDashboard: IDashboardBase = {
  identifier: "some-dashboard",
  title: "Some Dashboard",
  cards: [
    {
      entity: "SomeEntity",
      entityInstance: SomeEntityCrud.instance,
      type: "groupBy",
      title: "Records by Status",
      filters: [],
      layout: {
        cols: 12,
        sm: 12,
        md: 6,
        lg: 6,
        cardVariant: "outlined",
        height: 400
      },
      groupBy: {
        fields: ["status"],
        dateFormat: "day",
        render: "pie"
      }
    },
    {
      entity: "SomeEntity",
      entityInstance: SomeEntityCrud.instance,
      type: "paginate",
      title: "Latest Records",
      filters: [],
      layout: {
        cols: 12,
        sm: 12,
        md: 6,
        lg: 6,
        cardVariant: "outlined",
        height: 400
      },
      paginate: {
        columns: ["name", "status", "createdAt"],
        orderBy: "createdAt",
        order: "desc"
      }
    }
  ]
}

export {someDashboard}
export default someDashboard
```
---

## Plantilla base: componente Vue
```
vue
<script setup lang="ts">
import {ref} from "vue"
import {DashboardView} from "@drax/dashboard-vue"
import type {IDashboardBase, IDashboardCard} from "@drax/dashboard-share"
import someDashboard from "../dashboards/SomeDashboard"

const filters = ref([
  {field: "createdAt", operator: "gte", value: new Date(new Date().getFullYear(), new Date().getMonth(), 1)},
  {field: "createdAt", operator: "lte", value: new Date()},
])

const dashboard = ref<IDashboardBase>(someDashboard)

dashboard.value.cards?.forEach((card: IDashboardCard) => {
  card.filters = filters.value
})
</script>

<template>
  <v-container>
    <dashboard-view :dashboard="dashboard" />
  </v-container>
</template>
```
---

## Buenas prácticas

- Preferir dashboards pequeños y legibles antes que uno gigante
- Agrupar cards relacionadas visualmente
- Mantener títulos de card orientados a negocio
- Reutilizar filtros globales
- No inventar campos que no existan en la entidad
- No usar `paginate` si la intención es solo resumir
- No usar `groupBy` si la intención es inspección detallada de registros
- Mantener `identifier` sin espacios
- Mantener consistencia entre nombres de entidad y CRUD usado

---

## Anti-patrones

No hacer esto:

- crear cards sin `entity`
- omitir `entityInstance` cuando ya existe el CRUD
- mezclar columnas inexistentes en `paginate.columns`
- usar `groupBy.fields` con campos no indexables o irrelevantes sin justificación
- duplicar filtros distintos en cada card si deben ser globales
- crear dashboards sin componente Vue de renderización
- usar títulos genéricos como `Card 1`, `Card 2`

---

## Instrucción de salida para el agente

Cuando el usuario solicite un nuevo dashboard Drax, responder generando:

1. el archivo `src/dashboards/[Name]Dashboard.ts`
2. el archivo `src/components/[Name]Dashboard.vue`
3. una explicación breve de las cards incluidas
4. si falta contexto, preguntar:
    - módulo destino
    - entidad base
    - campos para `groupBy`
    - columnas para `paginate`
    - filtros globales requeridos

Si el usuario no especifica detalles suficientes, proponer una primera versión mínima útil con:
- 1 card `groupBy`
- 1 card `paginate`
- filtro por `createdAt` si la entidad lo soporta


