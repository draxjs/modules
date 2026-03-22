# Errors

## Propósito

`common-front` usa esta carpeta para convertir fallos de transporte o de negocio en errores que la UI puede consumir de forma uniforme. La idea es separar:

- errores crudos de HTTP y GraphQL
- errores de alto nivel para componentes, stores y formularios
- `inputErrors` listos para asociar mensajes a campos

## Contratos que usa la capa

### `IRestError`

Modela errores REST con:

```ts
{
  message: string
  statusCode: number
  body?: {
    statusCode?: number
    error?: string
    message?: string
    i18nMessage?: string
    inputErrors?: IInputError[]
  }
}
```

### `IGqlError`

Modela errores GraphQL con:

```ts
{
  message: string
  path: string[]
  extensions?: {
    code?: string
    inputErrors?: IInputError[]
  }
}
```

### `IInputError` e `IClientInputError`

- `IInputError` representa un error puntual: `field`, `reason` y opcionalmente `value`.
- `IClientInputError` es la forma adaptada para la UI:

```ts
{
  email: ['validation.unique'],
  password: ['validation.required', 'validation.min_length']
}
```

## Flujo general

### Para REST

- `HttpRestClient` hace la request con `fetch`.
- Si la respuesta llega con `response.ok === false`, lanza `HttpStatusError`.
- Luego `errorHandler()` transforma:
  - `4xx` en `ClientError`
  - `5xx` en `ServerError`
  - `TypeError` en `NetworkError`
  - `AbortError` en `ServerError`
  - cualquier otro caso en `UnknownError`

### Para GraphQL

- `HttpGqlClient` parsea `result.errors`.
- Si hay un solo error, lanza `GqlError`.
- Si hay varios, lanza `GqlMultiError`.
- Luego `errorHandler()` transforma:
  - `GqlError` en `ClientError`
  - `GqlMultiError` se devuelve tal cual
  - `HttpStatusError` en `ServerError`
  - `TypeError` en `NetworkError`
  - `AbortError` en `ServerError`
  - cualquier otro caso en `UnknownError`

## Errores HTTP base

### `HttpError`

- Es la clase base para errores REST.
- Implementa `IRestError`.
- Propiedades:
  - `message`
  - `statusCode`
  - `body`
- Nombre actual de clase en runtime: `HttpClientError`

Se usa como contenedor simple cuando hace falta propagar el status y el body que volvió del backend.

### `HttpStatusError`

- Extiende `HttpError`.
- Se crea cuando el servidor responde con un status no exitoso.
- Nombre actual: `HttpClientStatusError`
- `message`: `Status code error: <statusCode>`
- Conserva:
  - `statusCode`
  - `body`

Ejemplo típico:

```ts
new HttpStatusError(422, {
  statusCode: 422,
  error: 'ValidationError',
  i18nMessage: 'error.validation_error',
  inputErrors: [
    { field: 'email', reason: 'validation.unique' }
  ]
})
```

### `HttpNetworkError`

- Extiende `HttpError`.
- Representa problemas de red antes de tener respuesta del servidor.
- Nombre actual: `HttpClientNetworkError`
- `statusCode`: `0`
- `body`: cadena vacía
- `message`: `Network error`

Observación: esta clase existe, pero `HttpRestClient` actualmente transforma `TypeError` en `NetworkError`, no en `HttpNetworkError`.

### `HttpTimeoutError`

- Extiende `HttpError`.
- Representa timeout.
- Nombre actual: `HttpClientTimeoutError`
- `statusCode`: `0`
- `body`: cadena vacía
- `message`: `Timeout error`

Observación: aunque la clase existe, el cliente hoy traduce `AbortError` a `ServerError`, no a `HttpTimeoutError`.

## Errores GraphQL base

### `GqlError`

- Implementa `IGqlError`.
- Se construye a partir de un error devuelto por GraphQL.
- Expone:
  - `message`
  - `path`
  - `extensions`
- Tiene el getter `isBadUserInput`, que devuelve `true` si `extensions.code === 'BAD_USER_INPUT'`.

Es el error base cuando GraphQL devuelve un único problema de negocio o validación.

Ejemplo conceptual:

```ts
{
  message: 'BAD_USER_INPUT',
  path: ['createUser'],
  extensions: {
    code: 'BAD_USER_INPUT',
    inputErrors: [
      { field: 'email', reason: 'validation.unique' }
    ]
  }
}
```

### `GqlMultiError`

- Agrupa varios `GqlError`.
- Propiedad principal: `errors: GqlError[]`
- `message`: `Graphql Errors`

Se usa cuando la respuesta GraphQL trae más de un error. A diferencia de `GqlError`, este caso no se traduce a `ClientError`, sino que se devuelve tal cual desde `HttpGqlClient`.

## Errores de alto nivel para la UI

### `ClientError`

Es el error más importante para formularios y pantallas. Envuelve un `IRestError` o un `IGqlError` y extrae lo necesario para la interfaz.

Propiedades:

- `name`: `ClientError`
- `message`: se resuelve por prioridad
- `inputErrors`: `IClientInputError | undefined`
- `error`: referencia al error original

#### Cómo decide `message`

`ClientError.extractErrorMessage()` sigue este orden:

1. Si `body.inputErrors` existe, devuelve `error.validation`
2. Si `body.i18nMessage` existe, devuelve ese valor
3. Si `body.message` existe, devuelve ese mensaje
4. Si `body.error` existe, devuelve ese valor
5. Si el error original tiene `message`, usa ese
6. Si nada aplica, devuelve `error.client`

Esto hace que el mensaje final esté pensado para i18n o para una clave semántica, no necesariamente para mostrar texto literal del backend.

#### Cómo decide `inputErrors`

`ClientError.extractInputErrors()` busca:

- `error.body.inputErrors` para REST
- `error.extensions.inputErrors` para GraphQL

Luego `convertToKeyValue()` transforma:

```ts
[
  { field: 'email', reason: 'validation.unique' },
  { field: 'email', reason: 'validation.invalid' },
  { field: 'name', reason: 'validation.required' }
]
```

en:

```ts
{
  email: ['validation.unique', 'validation.invalid'],
  name: ['validation.required']
}
```

#### Cuándo aparece

- REST `4xx`
- GraphQL con un solo `GqlError`

Es el tipo correcto para alimentar errores por campo en formularios.

### `ServerError`

- `name`: `ServerError`
- `message`: `error.server`
- Guarda el error original en `error`

Se usa para representar fallos del servidor o situaciones que el cliente interpreta como indisponibilidad del backend.

Aparece en:

- REST `5xx`
- GraphQL con `HttpStatusError`
- `AbortError` en ambos clientes

### `NetworkError`

- `name`: `NetworkError`
- `message`: `error.network`
- Guarda el error original en `error`

Se usa cuando `fetch` falla por problemas de conectividad, CORS o DNS, típicamente mapeados desde `TypeError`.

### `UnknownError`

- `name`: `UnknownError`
- `message`: `error.unknown`
- Guarda el error original en `error`

Es el fallback cuando el error no entra en ninguna categoría anterior.

## Cuándo usar cada uno en la UI

- Usá `ClientError` cuando necesites mostrar mensajes de validación o asociarlos a campos.
- Usá `ServerError` para banners genéricos de fallo del backend.
- Usá `NetworkError` para estados de conectividad.
- Tratá `UnknownError` como fallback y loguealo.
- Si consumís GraphQL y recibís `GqlMultiError`, conviene iterar `errors` y decidir si agregás mensajes múltiples o un resumen.

## Observaciones de implementación actual

- `HttpNetworkError` y `HttpTimeoutError` existen, pero no son los tipos que hoy devuelve `HttpRestClient` o `HttpGqlClient` en esos casos.
- `AbortError` se transforma en `ServerError`, no en un error específico de timeout.
- `ClientError` prioriza claves de i18n o mensajes semánticos por encima del mensaje crudo del backend.
- En GraphQL, un solo error termina en `ClientError`, pero varios errores terminan en `GqlMultiError`, lo que obliga a la UI a contemplar ambos caminos.
