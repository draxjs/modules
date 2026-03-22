# CrudCreateButton

## Propósito

Botón simple para iniciar creación.

## Qué hace

- Renderiza un `v-btn` con ícono `mdi-plus`.
- Muestra tooltip `action.create`.
- Mezcla `$attrs` con las props del activador del tooltip, por lo que el padre puede escuchar `@click`.

## Ejemplo

```vue
<CrudCreateButton @click="openCreate" />
```
