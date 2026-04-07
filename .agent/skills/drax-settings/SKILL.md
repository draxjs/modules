---
name: drax-settings
description: Crear, registrar o consumir settings de Drax cuando el usuario necesite reemplazar variables de entorno por configuracion editable desde la UI, inicializar una setting en el backend, o leer su valor desde backend o frontend respetando `public` y `permission`.
---

# Drax Settings

Usar esta skill cuando el pedido implique:

- Crear una nueva setting del sistema.
- Registrar settings iniciales o defaults en el backend.
- Obtener el valor de una setting desde backend o frontend.
- Decidir visibilidad y permisos de una setting (`public`, privada o protegida por `permission`).

No usar settings para secretos que deban vivir solo en infraestructura o despliegue. Si el valor no debe ser editable desde la UI ni persistirse en la base, preferir variable de entorno.

## Modelo mental

Las settings de Drax son configuracion persistida en base de datos y editable desde la UI por usuarios con permisos de administracion. Son mas flexibles que una env var porque:

- se pueden cambiar sin redeploy,
- se exponen al frontend segun reglas de visibilidad,
- tambien pueden consumirse desde backend.

La inicializacion de defaults se hace de forma idempotente con `createOrUpdate`, normalmente en un archivo de setup similar a [`packages/zuite/zuite-back/src/setup/InitializeSettings.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/setup/InitializeSettings.ts).

## Campos importantes

Basarse en la forma real de `ISetting` y `settingSchema`:

- `key`: identificador estable en mayusculas o nombre tecnico consistente.
- `category`: grupo mostrado en la UI.
- `label`: nombre visible.
- `description`: ayuda para administracion.
- `type`: uno de `string`, `longString`, `number`, `enum`, `boolean`, `password`, `stringList`, `numberList`, `enumList`, `ref`, `secret`.
- `value`: valor persistido.
- `options`: obligatorio cuando `type` es `enum` o `enumList`.
- `regex`: validacion aplicada al actualizar valor.
- `entity`, `entityValue`, `entityText`: para `type: 'ref'`.
- `prefix`, `suffix`: solo metadata de presentacion/ayuda.
- `public`: define si anonimos pueden recibirla.
- `permission`: permiso extra requerido para verla.

## Reglas de visibilidad

La semantica real la define [`packages/settings/settings-back/src/controller/SettingController.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/settings/settings-back/src/controller/SettingController.ts):

- `public: true` y sin `permission`: visible incluso sin autenticacion.
- `public: false` o ausente y sin `permission`: visible solo para usuarios autenticados.
- con `permission`: visible solo si el usuario autenticado posee ese permiso, independientemente de `public`.

Consecuencia importante:

- si el frontend publico necesita el valor, usar `public: true` y no definir `permission`.
- si el frontend autenticado comun necesita el valor, dejar `permission` vacio y `public: false`.
- si solo ciertos roles deben verlo, definir `permission`.
- para backend, `SettingService` puede leerlo igual; la restriccion anterior aplica a endpoints expuestos al cliente.

## Inicializar una setting en backend

Patron recomendado:

1. Obtener el servicio con `SettingServiceFactory()`.
2. Registrar defaults en un setup de arranque.
3. Usar siempre `createOrUpdate` para que el proceso sea idempotente.
4. No confiar en `update` para cambiar defaults de `value`, porque `createOrUpdate` preserva el valor existente del usuario cuando la setting ya existe.

Ejemplo base:

```ts
import {SettingServiceFactory} from "@drax/settings-back"

async function InitializeSettings() {
  const settingService = SettingServiceFactory()

  await settingService.createOrUpdate({
    category: 'Branding',
    key: 'APP_NAME',
    value: 'Mi App',
    label: 'Nombre de la aplicacion',
    type: 'string',
    public: true,
    description: 'Nombre visible en la interfaz'
  })
}
```

Seguir como referencia directa [`packages/zuite/zuite-back/src/setup/InitializeSettings.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-back/src/setup/InitializeSettings.ts).

## Leer una setting en backend

Usar [`packages/settings/settings-back/src/services/SettingService.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/settings/settings-back/src/services/SettingService.ts).

Opciones practicas:

- `findByKey(key)`: devuelve la entidad completa.
- `cache(key)`: igual, con cache temporal.
- `cacheValue(key)`: devuelve solo el valor y evita repetir queries.

Patron recomendado para codigo de dominio:

```ts
import {SettingServiceFactory} from "@drax/settings-back"

const settingService = SettingServiceFactory()

const appName = await settingService.cacheValue('APP_NAME')
const analyticsEnabled = await settingService.cacheValue('ENABLE_ANALYTICS')
```

Usar `cacheValue` cuando solo se necesita el valor. Usar `findByKey` o `cache` si tambien hace falta `type`, `permission`, `description` u otra metadata.

Si el valor requiere parseo, hacerlo explicitamente en el punto de uso:

```ts
const maxRetries = Number(await settingService.cacheValue('MAX_RETRY_ATTEMPTS') ?? 0)
const enabled = (await settingService.cacheValue('ENABLE_ANALYTICS')) === 'true'
```

No asumir conversion automatica por `type`: el servicio persiste y devuelve `value` como string.

## Leer una setting en frontend

El frontend consume settings cargadas en el store de `@drax/settings-vue`.

Flujo real:

1. Al iniciar la app, ejecutar setup similar a [`packages/zuite/zuite-front/src/setup/SetupSetting.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/setup/SetupSetting.ts).
2. Ese setup llama `fetchSettings()` y se resuscribe a login/logout con `suscribeAuth()`.
3. Los componentes leen el valor desde `useSetting()` o `useSettingStore()`.

Composable principal: [`packages/settings/settings-vue/src/composables/UseSetting.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/settings/settings-vue/src/composables/UseSetting.ts)

Store: [`packages/settings/settings-vue/src/stores/UseSettingStore.ts`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/settings/settings-vue/src/stores/UseSettingStore.ts)

Patron recomendado en componentes:

```ts
import {computed} from 'vue'
import {useSettingStore} from '@drax/settings-vue'

const settingStore = useSettingStore()

const appName = computed(() => settingStore.getSettingValueByKey('APP_NAME'))
```

Ejemplo real: [`packages/zuite/zuite-front/src/layouts/default.vue`](/media/cincarnato/SSD480/code/drax/drax-framework/packages/zuite/zuite-front/src/layouts/default.vue)

Si el componente necesita asegurar carga o reaccionar a auth:

```ts
import {useSetting} from '@drax/settings-vue'

const {fetchSettings, settingValue} = useSetting()
await fetchSettings()

const appName = computed(() => settingValue.value('APP_NAME'))
```

## Criterios para elegir visibilidad

Elegir asi:

- branding, textos publicos, links publicos, colores de tenant: `public: true`.
- toggles internos visibles para cualquier usuario logueado: `public: false` sin `permission`.
- configuraciones sensibles o administrativas: `permission: 'setting:sensitive'` u otro permiso especifico.
- edicion de valores desde UI administrativa: asumir permisos del modulo settings, no inventar endpoints alternativos salvo necesidad real.

## Buenas practicas

- Usar `createOrUpdate` en setup; evita duplicados y mantiene inicializacion idempotente.
- Mantener `key` estable. Si cambia, tratarlo como migracion.
- Elegir `category`, `label` y `description` pensando en la UI admin.
- No confiar en `type` para parseo backend/frontend; convertir el string explicitamente.
- Definir `options` en enums y `entity*` en refs desde el inicio.
- Si agregas una setting usada por el frontend, verificar que el flujo de `fetchSettings()` ya corra en el arranque de esa app.

## Checklist al implementar

1. Crear o actualizar la inicializacion en backend con `createOrUpdate`.
2. Elegir correctamente `public` y `permission`.
3. Consumir en backend con `SettingServiceFactory()`.
4. Consumir en frontend con `useSetting()` o `useSettingStore()`.
5. Parsear el valor explicitamente si representa boolean, number o lista.
