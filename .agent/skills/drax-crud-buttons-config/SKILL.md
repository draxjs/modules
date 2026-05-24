---
name: drax-crud-buttons-config
description: Usa esta skill cuando necesites personalizar o extender de forma centralizada los botones reutilizables de @drax/crud-vue, especialmente iconos, variant, rounded y color de los componentes en packages/crud/crud-vue/src/components/buttons.
---

# Drax CRUD Buttons Config

Usa esta skill cuando trabajes con la configuracion visual centralizada de los botones de `@drax/crud-vue`.

La feature vive en:

- `packages/crud/crud-vue/src/config/CrudButtonConfig.ts`
- `packages/crud/crud-vue/src/components/buttons/*.vue`
- `packages/crud/crud-vue/src/index.ts`

## API Publica

El paquete exporta desde `@drax/crud-vue`:

- `configureCrudButtons(config)`: aplica overrides globales y por boton.
- `resetCrudButtonsConfig()`: limpia overrides y vuelve a defaults internos.
- `getCrudButtonConfig(buttonName)`: obtiene la configuracion efectiva de un boton.
- `useCrudButtonConfig(buttonName)`: composable reactivo para componentes Vue.
- `crudButtonDefaultStyles`: defaults internos actuales.
- `crudButtonsConfig`: estado reactivo de overrides.

Tipos exportados:

- `CrudButtonName`
- `CrudButtonGlobalStyle`
- `CrudButtonRounded`
- `CrudButtonStyle`
- `CrudButtonVariant`
- `CrudButtonsConfig`

## Botones Soportados

Usa estos nombres exactos en `buttons`:

- `ai`
- `columns`
- `create`
- `createOnTheFly`
- `delete`
- `dialogNext`
- `dialogPrev`
- `export`
- `filter`
- `groupBy`
- `import`
- `openRouteForm`
- `refresh`
- `savedQueries`
- `update`
- `view`

## Valores Configurables

En `defaults` solo configurar propiedades comunes a todos:

- `variant`
- `rounded`
- `color`

En `buttons[buttonName]` se puede configurar:

- `icon`
- `activeIcon` para botones con estado alternativo, actualmente `filter`.
- `variant`
- `rounded`
- `color`

`variant` debe ser un valor valido de Vuetify:

- `flat`
- `text`
- `elevated`
- `outlined`
- `plain`
- `tonal`

## Defaults Actuales

Mantener estos defaults si se modifica la feature:

```ts
{
  ai: { icon: "mdi-robot-outline", variant: "text" },
  columns: { icon: "mdi-view-column", variant: "text" },
  create: { icon: "mdi-plus", variant: "text" },
  createOnTheFly: { icon: "mdi-plus", variant: "text" },
  delete: { icon: "mdi-delete", variant: "text", color: "red" },
  dialogNext: { icon: "mdi-chevron-right", variant: "text" },
  dialogPrev: { icon: "mdi-chevron-left", variant: "text" },
  export: { icon: "mdi-database-export-outline", variant: "text" },
  filter: { icon: "mdi-filter", activeIcon: "mdi-filter-off", variant: "text" },
  groupBy: { icon: "mdi-chart-bar", variant: "text" },
  import: { icon: "mdi-database-import-outline", variant: "text" },
  openRouteForm: { icon: "mdi-open-in-new", variant: "text" },
  refresh: { icon: "mdi-refresh", variant: "text" },
  savedQueries: { icon: "mdi-content-save-cog", variant: "text" },
  update: { icon: "mdi-pencil", variant: "text", color: "blue" },
  view: { icon: "mdi-magnify", variant: "text", color: "teal" },
}
```

## Uso En Proyectos Consumidores

Configurar una sola vez en el bootstrap del proyecto, antes de montar la app o antes de renderizar pantallas CRUD.

```ts
import { configureCrudButtons } from "@drax/crud-vue";

configureCrudButtons({
  defaults: {
    variant: "tonal",
    rounded: "lg",
    color: "primary",
  },
  buttons: {
    create: { icon: "mdi-plus-circle-outline" },
    update: { icon: "mdi-square-edit-outline", color: "info" },
    delete: { icon: "mdi-trash-can-outline", color: "error" },
    filter: {
      icon: "mdi-filter-outline",
      activeIcon: "mdi-filter-remove-outline",
    },
  },
});
```

## Reglas Al Modificar Botones

- No hardcodear `icon`, `variant`, `rounded` o `color` en el boton principal de un componente dentro de `components/buttons`; usar `useCrudButtonConfig`.
- Mantener ids, clases, eventos, permisos y tooltips existentes.
- Si se agrega un nuevo boton reutilizable, agregar su nombre a `CrudButtonName`, su default a `crudButtonDefaultStyles`, usar `useCrudButtonConfig` en el componente y exportar tipos/API si cambia la superficie publica.
- Si un boton tiene dos estados visuales, usar `icon` para el estado normal y `activeIcon` para el alternativo.
- No mezclar esta configuracion con estilos CSS. Para estilos por selector usar la skill `drax-crud-style`.

## Verificacion

Despues de modificar esta feature, correr desde `packages/crud/crud-vue`:

```bash
npx vue-tsc --noEmit -p tsconfig.app.json
```

Si falla por errores en otros paquetes del monorepo, reportar esos errores como preexistentes y confirmar que no hay errores en `src/config/CrudButtonConfig.ts` ni en `src/components/buttons`.
