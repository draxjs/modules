# CrudCreateOnTheFlyButton

## Propósito

Permite crear una entidad relacionada sin salir del campo actual, normalmente desde `CrudAutocomplete`.

## Props

- `entity` (`IEntityCrud`, requerida)

## Evento

- `created`

## Cómo funciona

- Resetea `useCrudStore(entity.name)`.
- Llama `onCreate()` para preparar el store.
- Abre un `CrudDialog` no fullscreen.
- Renderiza un `CrudForm`.
- Cuando la creación termina, cierra el dialog y reemite `created(item)`.

## Ejemplo

```vue
<CrudCreateOnTheFlyButton :entity="categoryEntity" @created="item => categories.push(item)" />
```
