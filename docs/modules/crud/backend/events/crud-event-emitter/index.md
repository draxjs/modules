# CrudEventEmitter

## Propósito

`CrudEventEmitter` encapsula el bus de eventos CRUD interno del módulo. Su trabajo es ofrecer una única instancia compartida de `EventEmitter` y un método semántico para publicar eventos.

## Diseño

- extiende `EventEmitter`
- usa patrón singleton
- expone una sola API pública adicional: `emitCrudEvent`

## Singleton

La instancia se obtiene con:

```ts
CrudEventEmitter.getInstance()
```

Comportamiento:

- si no existe una instancia previa, la crea
- si ya existe, devuelve la misma

El constructor es privado, por lo que la clase solo puede usarse mediante `getInstance()`.

## Configuración interna

En el constructor llama:

```ts
this.setMaxListeners(100)
```

Eso aumenta el límite de listeners simultáneos permitido por `EventEmitter`.

## Publicación de eventos

`emitCrudEvent<T>(eventData: IDraxCrudEvent<T>)`

Qué hace:

- recibe un objeto tipado como `IDraxCrudEvent<T>`
- emite el evento `'crud:event'`
- entrega `eventData` como payload

## Relación con el resto del módulo

`AbstractFastifyController` usa este emitter para publicar:

- `created`
- `updated`
- `deleted`
- `exported`

El canal físico sigue siendo siempre el mismo: `crud:event`. La acción concreta viaja dentro del payload.

## Ejemplo de uso

```ts
const emitter = CrudEventEmitter.getInstance()

emitter.on('crud:event', (event) => {
  console.log(event.action, event.entity)
})
```

## Cuándo usarlo

Conviene cuando querés observar operaciones CRUD dentro del mismo proceso para auditoría, métricas o side effects desacoplados del controlador principal.
