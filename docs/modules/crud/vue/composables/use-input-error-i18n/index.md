# useInputErrorI18n

## Propósito

`useInputErrorI18n(entity)` traduce los errores de input guardados en `useCrudStore` usando las claves de i18n disponibles.

## Qué resuelve

- Lee `store.getFieldInputErrors(name)`.
- Traduce cada clave con `te()` y `t()`.
- Devuelve mensajes listos para mostrar en formularios.

## Piezas principales

- `inputErrorsI18n(name)`

## Cuándo usarlo

Usalo en formularios y componentes de campo cuando el backend devuelve errores como `validation.unique` o `validation.required`.

## Ejemplo

```ts
import { useInputErrorI18n } from '@drax/crud-vue'
import { UserCrud } from '@drax/identity-vue'

const { inputErrorsI18n } = useInputErrorI18n(UserCrud.instance)
```
