# Clients

## Propósito

La carpeta `clients` encapsula el acceso HTTP del frontend sobre `fetch` y ofrece dos implementaciones:

- `HttpRestClient` para endpoints REST
- `HttpGqlClient` para endpoints GraphQL

Ambas comparten la misma idea: centralizar base URL, headers, timeout y conversión de errores para que componentes y stores no trabajen directamente con `fetch`.

## Contratos públicos

### `IHttpClient`

El cliente REST expone:

```ts
get(url, options?)
post(url, data, options?)
put(url, data, options?)
delete(url, data?, options?)
patch(url, data, options?)
addHeader(name, value)
removeHeader(name)
getBaseHeaders()
getHeaderValue(name)
```

### `IHttpOptions`

Opciones soportadas por requests REST:

```ts
{
  headers?: { [key: string]: string }
  removeHeaders?: string[]
  params?: { [key: string]: string | number | boolean }
  timeout?: number
}
```

### `IGqlClient`

El cliente GraphQL expone:

```ts
query(query, variables?, options?)
mutation(query, variables?, options?)
upload(formData, options?)
addHeader(name, value)
removeHeader(name)
```

### `IGqlOptions`

Opciones soportadas por GraphQL:

```ts
{
  headers: { [key: string]: string }
  timeout: number
}
```

## `HttpRestClient`

### Qué resuelve

`HttpRestClient` implementa una capa REST con:

- `baseUrl` configurable
- headers base reutilizables
- timeout por cliente o por request
- serialización automática de JSON
- soporte para `FormData`
- conversión de errores HTTP a errores de alto nivel del módulo

### Constructor

```ts
new HttpRestClient(
  baseUrl = '',
  baseHeaders = { 'content-type': 'application/json' },
  timeout = 10000
)
```

### Métodos disponibles

#### `get(url, options?)`

- concatena `baseUrl + url`
- serializa `options.params` con `URLSearchParams`
- mezcla `baseHeaders` con `options.headers`
- elimina headers incluidos en `removeHeaders`
- si `response.ok` es `false`, lanza `HttpStatusError`
- si todo sale bien, devuelve `response.json()`

#### `post(url, data, options?)`

- serializa `data` como JSON salvo que sea `FormData`
- mantiene el mismo manejo de headers, timeout y errores

#### `put(url, data, options?)`

- mismo patrón que `post`

#### `delete(url, data?, options?)`

- envía body incluso en requests `DELETE`
- si no recibe `data`, usa `{}` como payload

#### `patch(url, data, options?)`

- serializa siempre con `JSON.stringify(data)`
- usa `baseUrl + url`
- devuelve `response.json()`

Observación: a diferencia de `post`, `put` y `delete`, `patch` no contempla `FormData` ni `removeHeaders`.

### Manejo de headers

El cliente mantiene un estado interno de headers:

- `addHeader(name, value)` agrega o pisa un header base
- `removeHeader(name)` lo elimina del cliente
- `getBaseHeaders()` devuelve el objeto completo
- `getHeaderValue(name)` permite consultar un valor puntual

Esto sirve para casos como tokens de autenticación persistidos en la instancia.

### Manejo de errores

`errorHandler()` traduce errores de bajo nivel así:

- `HttpStatusError` `4xx` -> `ClientError`
- `HttpStatusError` `5xx` -> `ServerError`
- `AbortError` -> `ServerError`
- `TypeError` -> `NetworkError`
- cualquier otro caso -> `UnknownError`

Esto significa que la UI rara vez ve un `HttpStatusError` directamente; normalmente recibe errores adaptados.

### Ejemplo

```ts
import { HttpRestClient } from '@drax/common-front'

const client = new HttpRestClient('/api')
client.addHeader('authorization', 'Bearer token')

const users = await client.get('/users', {
  params: { page: 1, active: true },
})
```

## `HttpGqlClient`

### Qué resuelve

`HttpGqlClient` implementa un cliente GraphQL simple con:

- URL configurable, por defecto `/graphql`
- headers base
- timeout configurable
- ejecución de queries y mutations
- soporte para uploads con `FormData`
- transformación de errores GraphQL en tipos del módulo

### Constructor

```ts
new HttpGqlClient(
  url = '/graphql',
  baseHeaders = { 'content-type': 'application/json' },
  timeout = 10000
)
```

### Métodos disponibles

#### `exec(query, variables, options?)`

Es el núcleo del cliente:

- arma `{ query, variables }`
- hace `POST` a `this.url`
- si el status HTTP falla, lanza `HttpStatusError`
- si la respuesta trae `result.errors`:
  - 1 error -> `GqlError`
  - más de 1 error -> `GqlMultiError`
- si todo sale bien, devuelve `result.data`

#### `query(query, variables?, options?)`

Es un alias de `exec()`.

#### `mutation(query, variables?, options?)`

También delega en `exec()`.

#### `upload(formData, options?)`

- envía `FormData` directo
- elimina manualmente `content-type` de los headers para que el navegador genere el boundary correcto
- conserva el mismo manejo de timeout y errores que `exec()`

### Manejo de headers

El cliente expone:

- `addHeader(name, value)`
- `removeHeader(name)`
- `setTimeout(timeout)`

No expone `getBaseHeaders()` como sí hace el cliente REST.

### Manejo de errores

`errorHandler()` traduce así:

- `GqlError` -> `ClientError`
- `GqlMultiError` -> se devuelve tal cual
- `HttpStatusError` -> `ServerError`
- `AbortError` -> `ServerError`
- `TypeError` -> `NetworkError`
- cualquier otro caso -> `UnknownError`

Esto implica una diferencia importante:

- un único error GraphQL se adapta para formularios y UI con `ClientError`
- múltiples errores GraphQL no se adaptan y llegan como `GqlMultiError`

### Ejemplo

```ts
import { HttpGqlClient } from '@drax/common-front'

const client = new HttpGqlClient('/graphql')

const data = await client.query(
  `
    query Users($page: Int) {
      users(page: $page) {
        items { _id name }
      }
    }
  `,
  { page: 1 }
)
```

## Integración con factories

Aunque las factories están documentadas en otra sección, estos clientes están pensados para ser consumidos también mediante:

- `HttpRestClientFactory.getInstance(url?)`
- `HttpGqlClientFactory.getInstance(url?)`
- `HttpClientFactory.getInstance(transport?, url?)`

Las factories devuelven singletons, por lo que cualquier cambio de headers o timeout impacta sobre la instancia compartida.

## Cuándo usar REST y cuándo GraphQL

- Usá `HttpRestClient` cuando el backend exponga rutas HTTP tradicionales y quieras trabajar con verbs explícitos.
- Usá `HttpGqlClient` cuando el backend concentre la API en `/graphql` y necesites queries, mutations o multipart uploads.
- Si el proyecto permite ambos, `HttpClientFactory` decide según `VITE_HTTP_TRANSPORT`.

## Observaciones de implementación actual

- Ambos clientes crean `AbortController` en el constructor y reutilizan la misma señal interna.
- `AbortError` se transforma en `ServerError`, no en un error de timeout específico.
- `post`, `put` y `delete` aceptan `FormData`, pero `patch` no.
- Los clientes asumen que la respuesta de error puede parsearse con `response.json()`.
- `HttpGqlClient` devuelve `result.data`, no el payload GraphQL completo con `data` y `errors`.

## Cuándo usarlo

Usá esta carpeta cuando quieras una capa de transporte reutilizable, con configuración centralizada y una salida de errores homogénea para el resto del frontend.
