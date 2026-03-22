# Ejemplo de Extension

## Propósito

Esta página muestra cómo una entidad concreta extiende `EntityCrud` usando patrones reales del repositorio. La referencia está tomada de:

- `packages/zuite/zuite-front/src/modules/people/cruds/CountryCrud.ts`
- `packages/zuite/zuite-front/src/modules/people/cruds/LanguageCrud.ts`
- `packages/zuite/zuite-front/src/modules/people/cruds/PersonCrud.ts`

No es una API inventada: los ejemplos y casos descritos salen de esas implementaciones.

## Patrón base repetido en las entidades reales

Las tres entidades siguen la misma estructura:

1. extienden `EntityCrud`
2. asignan `this.name` en el constructor
3. exponen un singleton vía `static get instance()`
4. sobreescriben `provider`
5. redefinen metadata de headers, fields, rules y flags

## Ejemplo base derivado del código real

```ts
class PersonCrud extends EntityCrud implements IEntityCrud {
  static singleton: PersonCrud
  private store

  constructor() {
    super()
    this.name = 'Person'
    this.store = useCrudStore(this.name)
  }

  static get instance(): PersonCrud {
    if (!PersonCrud.singleton) {
      PersonCrud.singleton = new PersonCrud()
    }
    return PersonCrud.singleton
  }

  get provider() {
    return PersonProvider.instance
  }

  get refs() {
    return {
      Country: CountryCrud.instance,
      Language: LanguageCrud.instance,
      Tenant: TenantCrud.instance,
      User: UserCrud.instance
    }
  }
}
```

## Qué overridear y qué problema resuelve

### `permissions`

Visto en `CountryCrud`, `LanguageCrud` y `PersonCrud`.

Qué resuelve:

- desacopla permisos genéricos de permisos reales del dominio
- permite que la UI consulte `person:view`, `country:create`, etc.

Ejemplo real:

```ts
get permissions() {
  return {
    manage: 'person:manage',
    view: 'person:view',
    create: 'person:create',
    update: 'person:update',
    delete: 'person:delete'
  }
}
```

### `headers`

Visto en las tres entidades.

Qué resuelve:

- define qué columnas muestra la tabla o galería
- controla títulos y keys visibles

Casos reales:

- `CountryCrud` expone `name`, `description`, `flag`, `metadata`, `tenant`, `createdBy`
- `LanguageCrud` muestra solo `name` e `icon`
- `PersonCrud` lista datos simples, refs, arrays y objetos

### `provider`

Es el override obligatorio real.

Qué resuelve:

- conecta la entidad con su implementación REST/GraphQL o provider concreto

Casos reales:

- `CountryProvider.instance`
- `LanguageProvider.instance`
- `PersonProvider.instance`

### `refs`

Usado en `CountryCrud` y `PersonCrud`.

Qué resuelve:

- habilita fields `ref` y `array.ref`
- permite a `CrudAutocomplete` y `CrudRefDisplay` resolver otras entidades

Casos reales:

- `TenantCrud.instance`
- `UserCrud.instance`
- `CountryCrud.instance`
- `LanguageCrud.instance`

### `rules`

Usado en las tres entidades.

Qué resuelve:

- validación por campo desde la definición de la entidad
- evita dispersar reglas dentro de cada formulario

Caso real:

```ts
get rules() {
  return {
    fullname: [(v: any) => !!v || 'Requerido'],
    languages: [],
    tenant: [],
    user: [],
  }
}
```

### `onInputs`

Usado en `LanguageCrud` y `PersonCrud`.

Qué resuelve:

- lógica reactiva asociada a un field concreto
- normalización o side effects sobre el store del CRUD

Caso real más claro:

```ts
get onInputs() {
  return {
    name: () => {
      const val = this.store.getFieldValue('name').toUpperCase()
      this.store.setFormFieldValue('name', val)
    }
  }
}
```

Esto convierte el valor en mayúsculas a medida que el usuario escribe.

### `fields`

Es el override más importante después del provider.

Qué resuelve:

- define el formulario y también parte de la semántica visual del CRUD
- controla tipos, defaults, labels, refs, agrupación y placeholders

Casos reales visibles en `PersonCrud`:

- `string`: `fullname`
- `boolean`: `live`
- `date`: `birthdate`
- `number`: `money`
- `password`: `secret`
- `ref`: `nationality`, `tenant`, `user`
- `array.string`: `hobbies`
- `fullFile`: `fullfile`
- `enum`: `race`
- `array.enum`: `interests`
- `array.ref`: `languages`
- `object`: `address`
- `array.object`: `skills`

Esto muestra para qué sirve `EntityCrud`: no solo describe una tabla, también describe un formulario complejo sin escribir componentes específicos por entidad.

### `filters`

Usado en `CountryCrud` y `PersonCrud`.

Qué resuelve:

- define filtros iniciales del listado
- construye la base de `formFilters`

Casos reales:

- `_id eq`
- `name like`
- `fullname eq`

En `LanguageCrud` el getter devuelve un array vacío.

### `tabs`

Usado en `PersonCrud`.

Qué resuelve:

- divide el formulario en pasos o grupos visuales
- funciona junto con `field.groupTab`

Caso real:

```ts
get tabs() {
  return ['BASIC', 'ADDRESS', 'SKILLS', 'MANAGE']
}
```

Problema que resuelve:

- cuando la entidad tiene muchos fields, evita un formulario plano demasiado largo

### `dynamicFiltersEnable`, `searchEnable`, `filtersEnable`

Casos reales:

- `LanguageCrud`: `dynamicFiltersEnable = true`
- `PersonCrud`: `searchEnable = false`, `filtersEnable = false`, `dynamicFiltersEnable = true`

Qué resuelven:

- desactivar búsqueda simple cuando no aporta valor
- ocultar filtros fijos y dejar solo filtros dinámicos
- adaptar el modo de exploración del listado a cada entidad

### `listMode`

Usado en `LanguageCrud` y `PersonCrud`.

Casos reales:

- `LanguageCrud` retorna `'gallery'`
- `PersonCrud` retorna `'resonsive'`

Qué resuelve:

- seleccionar cómo se ve el listado principal
- `gallery` favorece tarjetas
- `responsive` intenta alternar entre tabla y galería según breakpoint

Observación:

En `PersonCrud` el valor escrito es `'resonsive'`, no `'responsive'`.

### `isGroupable`

Las tres entidades lo activan en `true`.

Qué resuelve:

- habilita `CrudGroupByButton`
- permite agrupar por campos desde la UI

### `exportFormats`, `importFormats`, `exportHeaders`

Casos reales:

- todas mantienen `['CSV', 'JSON']`
- `exportHeaders` queda en `['_id']`

Qué resuelve:

- expone al flujo de export/import qué formatos soporta la entidad

## Cuándo conviene personalizar cada grupo de opciones

### Metadata mínima

Personalizá:

- `name`
- `provider`
- `permissions`

Útil cuando recién conectás una entidad al CRUD.

### Formulario y listado

Personalizá:

- `headers`
- `fields`
- `filters`
- `tabs`
- `listMode`

Útil cuando la entidad ya necesita una experiencia visual usable.

### Integraciones con otras entidades

Personalizá:

- `refs`

Útil cuando aparecen relaciones `ref` o `array.ref`.

### Reglas y side effects

Personalizá:

- `rules`
- `onInputs`

Útil cuando el formulario necesita validación o normalización específica.

### Flags de comportamiento

Personalizá:

- `searchEnable`
- `filtersEnable`
- `dynamicFiltersEnable`
- `isGroupable`
- `isExportable`
- `isImportable`

Útil cuando querés recortar o ampliar capacidades sin tocar los componentes genéricos.

## Ejemplo de lectura de los casos reales

- `CountryCrud` muestra un caso relativamente directo:
  - headers, refs, rules, fields y filtros básicos
- `LanguageCrud` muestra un caso pequeño:
  - normalización con `onInputs`
  - `listMode = 'gallery'`
- `PersonCrud` muestra el caso más completo:
  - múltiples refs
  - form por tabs
  - fields escalares, objetos, arrays y archivos
  - desactivación de búsqueda y filtros fijos
  - uso intensivo de la metadata para personalizar la UI

## Cuándo usar esta guía

Usá esta página cuando tengas que crear una nueva entidad CRUD y quieras decidir qué overrides conviene implementar primero y cuáles agregar después según la complejidad real de la entidad.
