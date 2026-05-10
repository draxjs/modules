# Agrupar Campos En Formularios CRUD

Usa este skill cuando necesites organizar campos de un formulario renderizado por `CrudForm` en grupos visuales mediante tabs o menú lateral.

## API Disponible

`CrudForm` agrupa los campos según estas propiedades de cada `IEntityCrudField`:

- `groupTab?: string`: coloca el campo dentro de una pestaña.
- `groupMenu?: string`: coloca el campo dentro de una sección seleccionable desde un menú lateral.

El CRUD debe declarar los grupos disponibles con getters:

```ts
get tabs() {
  return ['BASIC', 'ADDRESS', 'SKILLS', 'MANAGE']
}

get menus() {
  return []
}
```

Los nombres deben coincidir exactamente con los valores usados en `groupTab` o `groupMenu`.

## Campos Sin Grupo

Si un campo no define `groupTab` ni `groupMenu`, `CrudForm` lo muestra en la sección general superior del formulario:

```ts
{name: 'fullname', type: 'string', label: 'fullname', default: ''}
```

## Agrupar En Tabs

Para mostrar campos en tabs:

1. Define `get tabs()` en el CRUD.
2. Asigna `groupTab` en cada campo que pertenezca a una pestaña.

Ejemplo basado en `PersonCrud`:

```ts
get fields(): IEntityCrudField[] {
  return [
    {name: 'fullname', type: 'string', label: 'fullname', default: '', groupTab: 'BASIC'},
    {name: 'live', type: 'boolean', label: 'live', default: false, groupTab: 'BASIC'},
    {name: 'birthdate', type: 'date', label: 'birthdate', default: null, groupTab: 'BASIC'},
    {
      name: 'address',
      type: 'object',
      label: 'address',
      default: {country: '', city: '', street: '', zip: null},
      groupTab: 'ADDRESS',
      objectFields: [
        {name: 'country', type: 'string', label: 'country', default: ''},
        {name: 'city', type: 'string', label: 'city', default: ''},
        {name: 'street', type: 'longString', label: 'street', default: ''},
        {name: 'zip', type: 'number', label: 'zip', default: null}
      ]
    }
  ]
}

get tabs() {
  return ['BASIC', 'ADDRESS']
}
```

`CrudForm` renderiza una tarjeta con `v-tabs` y, para cada tab, muestra los campos cuyo `field.groupTab === tab`.

## Agrupar En Menu

Para mostrar campos en un menú lateral:

1. Define `get menus()` en el CRUD.
2. Asigna `groupMenu` en cada campo que pertenezca a una opción del menú.
3. Opcionalmente define `get menuMaxHeight()` para controlar la altura máxima del listado.

```ts
get fields(): IEntityCrudField[] {
  return [
    {name: 'fullname', type: 'string', label: 'fullname', default: '', groupMenu: 'BASIC'},
    {name: 'email', type: 'string', label: 'email', default: '', groupMenu: 'CONTACT'},
    {name: 'phone', type: 'string', label: 'phone', default: '', groupMenu: 'CONTACT'}
  ]
}

get menus() {
  return ['BASIC', 'CONTACT']
}

get menuMaxHeight() {
  return '420px'
}
```

`CrudForm` muestra la lista de `entity.menus` a la izquierda. Al seleccionar una opción, renderiza a la derecha los campos cuyo `field.groupMenu === menuSelected`.

## Traducciones

Los nombres de tabs y menús pasan por `vue-i18n`:

```vue
{{ te(tab) ? t(tab) : tab }}
{{ te(menu) ? t(menu) : menu }}
```

Si existe una traducción para el nombre del grupo, se usa la traducción. Si no existe, se muestra el string original.

## Errores De Validacion

`CrudForm` marca en rojo el nombre de un tab o menú cuando alguno de sus campos tiene errores:

- Tabs: revisa `store.getFieldInputErrors(field.name)` para los campos de ese `groupTab`.
- Menús: revisa `store.getFieldInputErrors(field.name)` para los campos de ese `groupMenu`.

Esto permite que errores de validación dentro de grupos no visibles sigan siendo detectables desde el encabezado del grupo.

## Reglas Practicas

- Usa `groupTab` cuando el formulario tenga pocos grupos principales y el usuario necesite navegar horizontalmente.
- Usa `groupMenu` cuando haya muchos grupos o grupos con nombres largos.
- No mezcles `groupTab` y `groupMenu` en el mismo campo.
- Mantén los valores de grupo como constantes simples y estables, por ejemplo `BASIC`, `ADDRESS`, `MANAGE`.
- Los campos solo aparecen dentro de un grupo si el grupo está declarado en `tabs` o `menus`.
- El orden visual de los grupos lo define el orden del array retornado por `tabs` o `menus`.
- El orden de campos dentro de cada grupo lo define el orden de `fields`.

## Referencias Del Codigo

- `packages/zuite/zuite-front/src/modules/people/cruds/PersonCrud.ts`: ejemplo de `groupTab` con `BASIC`, `ADDRESS`, `SKILLS` y `MANAGE`.
- `packages/crud/crud-vue/src/components/CrudForm.vue`: implementación que separa `generalFields`, `tabFields` y `menuFields`.
- `packages/crud/crud-share/src/interfaces/IEntityCrudField.ts`: definición de `groupTab` y `groupMenu`.
- `packages/crud/crud-vue/src/cruds/EntityCrud.ts`: valores por defecto de `tabs`, `menus` y `menuMaxHeight`.
