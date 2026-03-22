# useFormUtils

## Propósito

`useFormUtils(operation)` centraliza decisiones visuales del formulario según la operación actual.

## Qué resuelve

- Si el form debe quedar readonly.
- Qué color usar para submit.
- Qué `variant` de inputs conviene mostrar.

## Piezas principales

- `readonly`
- `submitColor`
- `variant`

## Cuándo usarlo

Conviene cuando un mismo formulario se reutiliza para crear, editar, ver o borrar.

## Ejemplo

```ts
const { readonly, submitColor, variant } = useFormUtils('delete')
```
