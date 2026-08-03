---
name: drax-identity-vue
description: Usar esta skill cuando se trabaje con autenticacion en Vue usando `@drax/identity-vue`, especialmente el composable `useAuth`, el store Pinia `useAuthStore`, datos de `authUser`, permisos de rol, guards de rutas, login/logout, cambio de tenant y validacion del token.
---

# Drax Identity Vue

Usar esta skill cuando el pedido implique consumir o modificar autenticacion frontend en Drax con `@drax/identity-vue`.

## Archivos fuente

Verificar comportamiento actual en estos archivos antes de cambiar codigo:

- `packages/identity/identity-vue/src/composables/useAuth.ts`: API principal para login, logout, permisos, token y usuario autenticado.
- `packages/identity/identity-vue/src/stores/AuthStore.ts`: store Pinia persistido con `accessToken` y `authUser`.
- `packages/identity/identity-vue/src/index.ts`: exports publicos del paquete.
- `packages/identity/identity-front/src/interfaces/IAuthFullUser.ts`: forma real de `authUser`.

## Imports

`@drax/identity-vue` exporta tanto el composable como el store:

```ts
import {useAuth, useAuthStore} from '@drax/identity-vue'
```

Preferir `useAuth()` para acciones y reglas de autenticacion. Usar `useAuthStore()` cuando se necesita leer estado reactivo como `authUser`, `accessToken`, `isAuth` o getters del store.

## Modelo mental

`useAuthStore()` es el estado persistido de autenticacion:

- `accessToken`: JWT actual o `null`.
- `authUser`: usuario actual completo o `null`.
- `isAuth`: getter booleano que solo verifica que exista `accessToken`.
- `hasPermission(permission)`: getter que busca el permiso en `authUser.role.permissions`.
- `tokenIsValid()`: getter funcion que valida el JWT con `AuthHelper.isJWTValid`.
- `clearAuth()`: borra token y usuario del store.

`useAuth()` envuelve el store y el `AuthSystem` de `@drax/identity-front`. Retorna estos workflows y helpers:

- `login(username, password)`: obtiene token, lo guarda, llama `me()` y guarda `authUser`.
- `loginWithToken(token)`: guarda token y carga `authUser` si el token es valido.
- `logout()`: llama `clearAuth()` y navega a la ruta `{ name: 'Login' }`.
- `fetchAuthUser()`: llama `me()`, actualiza `authUser` y devuelve el usuario.
- `switchTenant(tenantId)`: cambia tenant, reemplaza token y recarga `authUser`.
- `hasPermission(permission)`: devuelve `false` si el permiso es `undefined` o si el usuario no lo tiene.
- `tokenIsValid()`: valida el JWT actual.
- `isAuthenticated()`: devuelve `true` solo si hay `authUser` y el token es valido.

Tambien define un `clearAuth()` interno que ejecuta `authSystem.logout()` y limpia el store, pero actualmente no lo retorna como API publica del composable.

## Verificar autenticacion

Para guards, menus y pantallas que requieren sesion valida, usar `useAuth().isAuthenticated()`:

```ts
import {useAuth} from '@drax/identity-vue'

const {isAuthenticated} = useAuth()

if (!isAuthenticated()) {
  // redirigir o bloquear acceso
}
```

No usar `authStore.isAuth` como prueba fuerte de sesion: ese getter solo comprueba que `accessToken` no sea `null`; no valida expiracion ni exige `authUser`.

Usar `authStore.isAuth` solo para casos livianos donde alcanza saber si hay token persistido, por ejemplo estados iniciales de UI no criticos.

## Verificar permisos

Patron recomendado:

```ts
import {useAuth} from '@drax/identity-vue'

const {hasPermission} = useAuth()

const canManageUsers = hasPermission('user:manage')
```

En templates Vue, los refs no estan involucrados porque `hasPermission` es una funcion normal:

```vue
<v-btn v-if="hasPermission('user:create')">
  Crear usuario
</v-btn>
```

`hasPermission(undefined)` devuelve `false`, por eso se puede usar con metadata opcional:

```ts
if (route.meta.permission && !hasPermission(route.meta.permission as string)) {
  // bloquear acceso
}
```

Tambien existe `authStore.hasPermission(permission)`, pero en componentes y guards normalmente conviene usar el helper de `useAuth()` para mantener una sola forma de consumir autenticacion.

## Leer datos del usuario

`authUser` tiene esta forma base:

```ts
interface IAuthFullUser {
  id: string
  username: string
  email: string
  active: boolean
  name: string
  phone: string
  avatar: string
  role: IRole
  tenant?: ITenant
}
```

Leerlo desde el store para conservar reactividad:

```ts
import {computed} from 'vue'
import {useAuthStore} from '@drax/identity-vue'

const authStore = useAuthStore()

const userId = computed(() => authStore.authUser?.id)
const username = computed(() => authStore.authUser?.username)
const displayName = computed(() => authStore.authUser?.name || authStore.authUser?.username)
const email = computed(() => authStore.authUser?.email)
const roleName = computed(() => authStore.authUser?.role?.name)
const tenantName = computed(() => authStore.authUser?.tenant?.name)
```

En templates se puede leer directo con optional chaining:

```vue
<span>{{ authStore.authUser?.username }}</span>
<span>{{ authStore.authUser?.tenant?.name || '-' }}</span>
```

Para obtener datos frescos del backend despues de una modificacion del perfil, usar `fetchAuthUser()`:

```ts
const {fetchAuthUser} = useAuth()

const authUser = await fetchAuthUser()
```

## Token

Para leer el token actual:

```ts
const authStore = useAuthStore()
const token = authStore.accessToken
```

Para validar expiracion o formato del JWT:

```ts
const {tokenIsValid} = useAuth()

if (!tokenIsValid()) {
  // token ausente o invalido
}
```

Evitar parsear el JWT manualmente en componentes. Usar `tokenIsValid()` o APIs de `@drax/identity-front` cuando haga falta comportamiento de autenticacion.

## Login, logout y carga inicial

Login normal:

```ts
const {login} = useAuth()

await login(username, password)
```

Login con token externo:

```ts
const {loginWithToken} = useAuth()

await loginWithToken(accessToken)
```

Logout con navegacion a `Login`:

```ts
const {logout} = useAuth()

logout()
```

Limpieza sin navegacion desde el store:

```ts
const authStore = useAuthStore()

authStore.clearAuth()
```

Nota: `clearAuth()` existe dentro de `useAuth()` y se usa internamente, pero no esta incluido en el objeto retornado actualmente. Si se necesita consumirlo publicamente desde el composable, primero actualizar `useAuth.ts`.

## Guards de rutas

Patron real usado en el repo:

```ts
const {isAuthenticated, hasPermission} = useAuth()

if (
  (!['Login'].includes(to.name as string) && to.meta.auth && !isAuthenticated()) ||
  (to.meta.permission && !hasPermission(to.meta.permission as string))
) {
  return {name: 'Login'}
}
```

Mantener permisos como strings consistentes con backend y CRUD, por ejemplo `user:manage`, `tenant:view`, `user:switchTenant`.

## Cambio de tenant

Usar `switchTenant(tenantId)` cuando el usuario cambia de tenant desde UI:

```ts
const {switchTenant} = useAuth()

await switchTenant(tenantId)
```

El workflow reemplaza el `accessToken` y vuelve a cargar `authUser`, por lo que los datos dependientes de tenant deben leerse reactivamente desde `useAuthStore()`.

## Buenas practicas

- Para seguridad de UI, preferir `isAuthenticated()` sobre `authStore.isAuth`.
- Para permisos opcionales, pasar por `hasPermission()` y dejar que devuelva `false`.
- Usar optional chaining al leer `authUser`, porque puede ser `null` durante arranque, logout o token invalido.
- No duplicar estado de usuario en stores locales salvo que haya una razon concreta; derivar con `computed`.
- Despues de cambios de perfil/avatar/tenant, refrescar usuario con `fetchAuthUser()` o usar el workflow existente que ya lo hace.
- Si se modifica la API publica de `useAuth()`, actualizar `packages/identity/identity-vue/src/index.ts` solo si cambia el export del modulo, y buscar usos con `rg "useAuth\\(" packages`.
