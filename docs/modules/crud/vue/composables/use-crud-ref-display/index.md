# useCrudRefDisplay

## Propósito

`useCrudRefDisplay()` resuelve un texto legible para campos de referencia consultando la entidad relacionada.

## Qué resuelve

- Acepta un valor simple o un arreglo de ids.
- Usa `entity.provider.findByIds()` para cargar referencias.
- Devuelve un string unido por comas con el campo indicado en `refDisplay`.

## Piezas principales

- `refDisplay(entity, value, refDisplay)`

## Cuándo usarlo

Conviene en tablas, vistas o galerías cuando un campo guarda ids pero la UI necesita mostrar nombres o labels.

## Ejemplo

```ts
const { refDisplay } = useCrudRefDisplay()

const label = await refDisplay(UserCrud.instance, ['1', '2'], 'username')
```
