# identity-front

This template should help get you started developing with Vue 3 in Vite.

## Remember-me sessions

Remember-me is disabled unless the consuming Vite app defines
`VITE_DRAX_REMEMBER_ME_ENABLED=true` (exact string). `IdentityLogin` includes the
exported `IdentityRememberMe` checkbox, localized in English/Spanish and initially
unchecked. Custom login forms can use `<IdentityRememberMe v-model="rememberMe" />`
and `useAuth().login(username, password, rememberMe)`. Ordinary logins still call
`AuthSystem.login` with only two arguments and discard any previous refresh token.

Install the persisted-state plugin on Pinia, then await `setupAuthSession()` after
installing Pinia and **before** installing the router or starting API requests.
The setup function does not require a component or router context. Enable the
backend separately with `DRAX_REMEMBER_ME_ENABLED=true`; its optional
`DRAX_REFRESH_TOKEN_TTL_SECONDS` defaults to 2592000 (30 days). Neither flag
changes the normal JWT expiration.

```ts
import {setupAuthSession} from '@drax/identity-vue'

app.use(pinia)
await setupAuthSession()
app.use(router)
```

Custom guards should await `refreshAuthSession()` before existing auth/permission
checks, catch transient maintenance errors, retain recoverable
credentials and cancel protected navigation until retry rather than treating
network failure as logout. Zuite's `router/authGuard.ts` provides the complete
example, including permission checks and login redirection. Publish/upgrade
`common-front`, `identity-front`, `identity-share` and the identity backend/Vue
packages together when enabling this feature.

Integration contracts:

- `AuthSystem.login(username, password, rememberMe?)`, `refresh(refreshToken)` and
  `revokeSession(refreshToken)` must implement the identity-front contract. Login
  and refresh return `{accessToken, refreshToken?, refreshExpiresAt?}`. Expiration
  dates are ISO strings. Front providers must not persist session data.
- The shared `HttpRestClientFactory.getInstance()` client may implement
  `setBeforeRequest(handler)`. The handler must run **before** copying authorization
  headers. Without this optional method, startup renewal works but automatic
  renewal before subsequent REST requests is unavailable.
- The hook excludes login/refresh/logout. Renewal uses a 30-second access-token
  expiry margin, single-flight per store/tab, and Web Locks plus synchronous
  `AuthStore` persistence/re-reading across tabs. Browsers without Web Locks only
  have same-tab coordination; concurrent cross-tab rotation is not guaranteed.
- Profile reload after renewal bypasses only its own `/api/auth/me` preflight to
  avoid recursion. If the profile is absent after a transient failure, subsequent
  session maintenance retries it single-flight even with a fresh JWT, without
  rotating again. Startup does not immediately repeat a failed profile request.
- `AuthStore.sessionVersion` is a persisted operation epoch changed by clearing
  auth (including login/token-login start and logout). Pending login, refresh and
  profile results check this epoch before committing, including cross-tab
  null-to-null logout. Legacy stores without the field use the initial null epoch.
  Late returned refresh credentials are revoked best-effort.
- Transient refresh/profile errors retain recoverable credentials; rejected
  credentials (HTTP 401/403/498, including common-front wrapped errors) clear auth.
  Logout clears local state immediately, with best-effort server revocation even
  when the feature has subsequently been disabled. Offline revocation cannot be
  guaranteed; the backend expiration/revocation policy remains authoritative.
- Normal sessions are never renewed. Remember-me renewal is REST-only, not a
  GraphQL preflight. Tokens live in localStorage via `AuthStore`; protect the app
  against XSS and do not log or expose refresh tokens.

Focused tests:

```sh
npm exec --workspace @drax/identity-vue -- vitest run test/auth-session.spec.ts test/auth-session.integration.spec.ts test/components/__tests__/IdentityLogin.spec.ts
```

## Expired sessions and external login migration

Session maintenance runs even with remember-me disabled or without a refresh token.
Expired/malformed access tokens without renewal are cleared together with the profile,
refresh credentials, persisted state and shared authorization headers. With remember-me
disabled, a live access token remains usable, but legacy refresh credentials are discarded.
`AuthStore.isAuth` checks local JWT validity, not mere token presence. This check is not
signature verification: the backend remains authoritative.

Store token/clear actions synchronize both shared clients. `syncAuthHeaders()` never
installs an expired/malformed JWT; transient refresh errors preserve recoverable tokens
in storage, remove expired authorization from the clients and reject the authenticated
REST preflight before fetch. There is no navigation or automatic request replay.
Removing a header directly is only a transport operation and intentionally does **not**
clear the store: use session/store actions for credential changes. Direct `$patch` is
not a session API; normal request maintenance re-reads persisted state.

External login should use the public workflow:

```ts
useAuth().loginWithSession(
  operation: (rememberMe: boolean) => Promise<ILoginResponse>,
  rememberMe = false,
): Promise<void>
```

`ILoginResponse` is the existing exported type from `@drax/identity-front`:
`{accessToken: string, refreshToken?: string, refreshExpiresAt?: string}`.
The workflow clears the previous credentials/profile, captures the operation epoch,
then calls `operation` with the effective frontend flag + explicit opt-in. It confirms
the session, synchronizes headers and loads the profile using the same path as standard
login. Failures reject the promise; only navigate after successful completion.
Discarded or unwanted refresh credentials are revoked best-effort. A profile failure
clears the current attempted login; offline revocation cannot be guaranteed.

**Start the entire async exchange inside the callback.** Passing a promise started
before the workflow, or awaiting the response then calling `loginWithToken`, cannot
protect against logout/new login while that request is pending. Legacy
`loginWithToken(string)` remains available for access-token-only callers; it does not
accept or persist refresh credentials.

Example consumer component (the consumer's Google integration supplies
`obtainGoogleCredential`; no Google SDK is added to Drax):

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {HttpRestClientFactory} from '@drax/common-front'
import type {ILoginResponse} from '@drax/identity-front'
import {IdentityRememberMe, useAuth} from '@drax/identity-vue'
import {obtainGoogleCredential} from './googleCredential'

const rememberMe = ref(false)
const loading = ref(false)
const {loginWithSession} = useAuth()
const router = useRouter()

async function loginGoogle() {
  loading.value = true
  try {
    await loginWithSession(async effectiveRememberMe => {
      const credential = await obtainGoogleCredential()
      return await HttpRestClientFactory.getInstance().post('/api/google/login', {
        credential, rememberMe: effectiveRememberMe,
      }, {removeHeaders: ['Authorization']}) as ILoginResponse
    }, rememberMe.value)
    await router.push('/') // Adapt to the consumer's authorized destination.
  } catch {
    // Show the consumer's localized error; never log credentials or headers.
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <IdentityRememberMe v-model="rememberMe" />
  <v-btn :loading="loading" :disabled="loading" @click="loginGoogle">Google</v-btn>
</template>
```

This checkbox starts unchecked and hides itself when the feature is disabled. It is
independent from the private checkbox inside `IdentityLogin`; an external button must
supply its own explicit opt-in. The callback receives a snapshot, not a later checkbox
value. Do not write tokens to Pinia/localStorage or manipulate Authorization manually.

Use `removeHeaders: ['Authorization']` on the external exchange: it excludes stale
bearer credentials and skips Drax session preflight for that request, without mutating
global headers or disabling browser CORS preflight. There is no second refresh/retry
mechanism. The backend must verify the external identity before issuing any Drax
session; see `identity-back/docs/remember-me.md`.

Consumer changes:

- **GoogleProvider:** add `removeHeaders: ['Authorization']` to the login POST and
  remove redundant `setHttpClientToken` calls and return the full `ILoginResponse`.
  Invoke that provider inside `loginWithSession(effectiveRememberMe =>
  provider.login(credential, effectiveRememberMe), rememberMe)`; obtain the credential
  inside the callback too if that step is asynchronous. Do not start the request first.
- **LoginPage:** delete the workaround that checks invalid access tokens and calls
  `logout()`. Session cleanup belongs to maintenance, not a page (logout also navigates).
- **Bootstrap:** retain `app.use(pinia); await setupAuthSession(); app.use(router)`;
  install Pinia's persisted-state plugin before these calls. No extra cleanup needed.
- **Router:** retain the existing `await refreshAuthSession()` plus catch and cancel
  protected navigation while `!isAuthenticated() && isRememberMeEnabled() &&
  authStore.refreshToken`. Do not convert transient failures into logout or redirects.
- **Backend external route:** replace the Google-specific middleware wrapper with
  the supported Fastify route option `{config: {identityJwt: 'ignore'}}` on the POST
  route. Keep its external credential verifier and normal authorization checks.
  A public route with optional JWT authentication still rejects a supplied invalid
  Bearer; only this explicit option ignores it. See identity-back's
  `docs/jwt-route-policy.md`.

The two local workarounds can therefore be removed after upgrading compatible packages
and declaring the external route policy. Google SDK/signature verification itself is
consumer-owned; Drax tests use a deterministic external verifier, not Google's service.
REST request-time maintenance requires the shared client's optional `setBeforeRequest`;
GraphQL and custom clients without that hook do not get automatic preflight renewal.

### External remember-me rollout and security

This change requires new releases of **`@drax/identity-back` and
`@drax/identity-vue`**. No new type or runtime changes are needed in identity-front,
identity-share or common-front for this extension, but consumers must retain compatible
remember-me APIs and the shared REST preflight (avoid duplicate singleton packages).
No publication/version is implied by this source change. Deploy the compatible backend
and its verified external endpoint first, then update/rebuild the frontend coherently.
The user must log in again and explicitly check the option; existing ordinary sessions
are not upgraded.

Keep `DRAX_REMEMBER_ME_ENABLED=true`, optional
`DRAX_REFRESH_TOKEN_TTL_SECONDS=2592000` on the backend and
`VITE_DRAX_REMEMBER_ME_ENABLED=true` at frontend build time. Refresh has an absolute
TTL, uses the user's **currently assigned database tenant**, and does not extend JWT
lifetime. A tenant selected with switchTenant must be selected again after renewal.

Storage contains sensitive credentials in **localStorage**, not HttpOnly cookies.
Use HTTPS and XSS protections. Web Locks coordinates refresh across tabs when available;
without it, single-flight is per tab only. Disabling the backend flag blocks new
remembered sessions/refresh; disabling the frontend flag prevents opt-in and maintenance
strips legacy local refresh credentials. Neither flag revokes already-issued JWTs or
all server refresh records. Re-enabling can make unexpired, non-revoked refresh tokens
usable again. Logout revokes the latest known Drax refresh token best-effort.

Drax refresh tokens renew **Drax sessions only**. They are not Google's OAuth refresh
or access tokens and do not grant Gmail/Calendar access or offline Google API consent.
Keep Google API authorization and its token storage separate.

## Registro con creación de tenant (opcional, REST)

En el **backend**:

```dotenv
DRAX_REGISTRATION_TENANT_ENABLED=true
DRAX_DEFAULT_ROLE=Member
```

Cargá `LoadIdentityConfigFromEnv()`, registrá `UserRoutes` y creá previamente el rol
configurado. Sin la flag, o con `false`, el registro no crea tenants. No se necesita
una variable Vite: `IdentityRegistration`, usado por `RegistrationPage`, consulta
`GET /api/auth/registration-options` → `{tenantRequired: boolean}`. Mientras no pueda
cargar estas opciones, bloquea el envío y permite reintentar.

Si está activo, el formulario exige un nombre de organización y envía
`tenantName` en `POST /api/users/register`. El backend crea un tenant **nuevo** y
asigna el usuario a ese tenant; rechaza nombres existentes con HTTP 422,
`tenantName: validation.unique`. No vincula visitantes a tenants existentes. Los
nombres se recortan y la unicidad es exacta y sensible a mayúsculas, igual que el
índice MongoDB existente. SQLite también aplica un índice único, incluyendo bases
ya creadas; si hay duplicados previos, hay que resolverlos manualmente antes de
inicializar. No se borran ni renombran datos automáticamente.

Para formularios propios, usá `useAuth().registrationOptions()` y
`useAuth().register({...datos, tenantName})`. El rol y el ID de tenant los determina
el servidor; enviar `role`, `tenant` o `active` no los sobreescribe. El usuario
continúa inactivo hasta la verificación existente por email/teléfono; no hay
login automático. Si falla la creación del usuario antes de persistir, se elimina
el tenant recién creado; si ya se persistió o falla después el email, se conserva
la asociación. No es una transacción distribuida entre bases/servicios.

Desplegá backend y frontend compatibles: el formulario actualizado requiere el
nuevo endpoint incluso cuando la flag está apagada. El registro GraphQL no está
implementado; su provider devuelve `tenantRequired: false` para las opciones.

## Verificación de email y reenvío (REST)

`register(form)` conserva `{success, message}` y ahora devuelve el tipo público
`IRegistrationResponse` de `@drax/identity-front`, con
`verificationEmailSent?: boolean`. `true` indica aceptación por SMTP, **no entrega**;
`false` indica que la cuenta se creó pero el correo quedó pendiente. La ausencia
mantiene el comportamiento anterior. Un fallo SMTP ya no implica un error de
registro ni habilita la cuenta: no hay login automático.

`IdentityRegistration` muestra una advertencia si el valor es `false` y mantiene
el mensaje de éxito existente para `true` o ausente. Ofrece un botón de acceso al
reenvío (`auth.verificationResendTitle`), con el email prellenado, tanto desde el
formulario como después del éxito/advertencia o de un error (duplicado o red).
Al abrirlo, el reenvío **reemplaza** el formulario o el resultado del registro y
oculta el botón de acceso. «Volver al registro» (`auth.backToRegistration`) restaura
el estado anterior, conservando inputs, email, tenant y resultado de éxito/advertencia.
No es necesario crear otra cuenta ni agregar rutas.

El acceso al reenvío está **solo en registro**, separado del formulario principal
con un margen superior. `IdentityLogin` conserva los enlaces de registro y de
recuperación de contraseña según sus props, pero no muestra el acceso a verificación.
El reenvío solicita email explícitamente. Hay un único formulario visible, sin
formularios simultáneos ni anidados, y un único título de reenvío:
`auth.verificationFormTitle` («Account verification» / «Verificación de cuenta»).

El componente reutilizable está exportado:

```vue
<script setup lang="ts">
import {IdentityVerificationResend} from '@drax/identity-vue'
</script>

<template>
  <IdentityVerificationResend email="persona@example.com" />
</template>
```

La prop `email` es opcional y editable. La prop opcional `backLabel?: string`
muestra un botón de vuelta de tipo `button` que emite `back`; está deshabilitado
mientras se procesa la solicitud. El componente padre decide qué restaurar al
recibir ese evento. Sin `backLabel`, el uso standalone conserva un único botón de
envío. El botón submit queda alineado a la derecha mediante un `v-spacer` anterior.
Formularios propios pueden usar `useAuth().resendVerificationEmail(email)` o
`AuthSystem.resendVerificationEmail(email)`.
REST hace `POST /api/users/verification/resend` con `{email}`. Tanto este endpoint
como el registro son anónimos: no envían `Authorization`, no disparan el preflight
de refresh y no borran las cabeceras del cliente compartido.

El resultado de reenvío es siempre neutral para cuentas inexistentes, verificadas,
limitadas o con fallo SMTP: `{success: true, message: 'If an account is pending
verification, activation instructions will be sent.'}`. La UI usa traducciones
es/en neutrales, sin confirmar existencia de la cuenta ni envío o entrega del
correo. Valida el email, muestra errores de red/`ClientError` y bloquea el envío
durante la solicitud. No impone una cuenta regresiva fija: el cooldown lo decide
el servidor (60 segundos por defecto, configurable). GraphQL rechaza esta operación
explícitamente como no implementada; no se crea una query ni mutación ficticia.
Los providers personalizados anteriores pueden omitir el método opcional de
`IAuthProvider`; sus APIs previas siguen funcionando y `AuthSystem` rechaza el
reenvío con un error explícito si el provider no lo soporta.

### Backend: vencimiento, límites y recuperación de cuentas anteriores

Configuración opcional, cargada con `LoadIdentityConfigFromEnv()`:

```dotenv
DRAX_EMAIL_VERIFICATION_TTL_SECONDS=86400
DRAX_EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60
```

Ambos valores deben ser segundos enteros positivos. El código es de un solo uso y
vence a las 24 horas por defecto. Reenviar reutiliza un código vigente sin extender
su vencimiento; rota el código únicamente si venció o si el registro anterior no
tenía vencimiento. Los enlaces antiguos sin vencimiento ya no activan cuentas:
para recuperarlas, solicitá un reenvío con el email original desde login/registro.
No hace falta borrar ni volver a crear usuario o tenant. Solo son elegibles cuentas
con `origin: 'Registry'` y email sin verificar; el reenvío no altera sus datos ni
reactiva cuentas verificadas que hayan sido desactivadas administrativamente.

El cooldown por email se reclama atómicamente en la base de datos, también cuando
SMTP falla. Se admiten 10 intentos de reenvío por IP cada 15 minutos por proceso,
con memoria acotada; incluso los emails inexistentes consumen ese límite. En un
despliegue multiinstancia, agregá un rate limiter compartido/gateway y configurá
correctamente la IP de cliente detrás del proxy. No hay cola ni reintentos
automáticos de correo: el usuario solicita el reenvío. La persistencia SQLite se
actualiza de forma aditiva al inicializar el repositorio; no se borran registros.

Actualizá backend, `identity-share`, `identity-front` e `identity-vue` de forma
coherente y desplegá backend antes de la UI nueva. En el monorepo compilá primero
`identity-share` para que los tipos utilizados por los demás paquetes estén al día.

Pruebas enfocadas: `test/verification-resend.spec.ts`, `test/registration.spec.ts`,
`test/components/__tests__/IdentityLogin.spec.ts`,
`test/auth-session.integration.spec.ts` y
`../identity-front/test/verification-resend.test.ts`.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
