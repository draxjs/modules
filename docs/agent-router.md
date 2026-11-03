# Router conversacional de agentes

## Alcance y activación en Zuite

El router `auto` clasifica cada mensaje y, como máximo, ejecuta **un** especialista autorizado. No es un planificador: no encadena especialistas, no llama otros routers, no hace recursión ni ejecuta tareas en paralelo. Si un pedido requiere varios dominios, solicita separarlo y no ejecuta una parte por su cuenta.

La integración de demostración está en `packages/zuite/zuite-back/src/setup/InitializeAgent.ts`. `SetupDrax` sigue llamando `await initializeAgent()` sin opciones: conserva los cuatro agentes manuales, sus prompts y tools, sin agregar metadata de routing ni restricciones de acceso nuevas. No registra `auto`.

```ts
interface InitializeAgentOptions {
    router?: boolean
    includeGeneralAssistant?: boolean
    routingProvider?: IAIProvider
    routingModel?: string
}
```

Para activar el router, reemplazar la llamada de inicialización en el bootstrap de la aplicación consumidora por:

```ts
import {AiProviderFactory} from '@drax/ai-back'
import {initializeAgent} from './InitializeAgent.js'

await initializeAgent({
    router: true,
    routingProvider: AiProviderFactory.instance('DeepSeek'),
    routingModel: 'deepseek-chat'
})
```

Este ejemplo es de configuración, **no una certificación de compatibilidad del modelo**. Requiere credenciales y configuración propias del proveedor. La inicialización solamente registra agentes y guarda la referencia del provider/model recibido: no resuelve un provider por su cuenta ni hace inferencias. La llamada explícita a `AiProviderFactory.instance(...)` del ejemplo pertenece al bootstrap consumidor. No incluir claves en código, frontend, repositorios ni documentación.

Con `router: true`:

| Identificador | Rol | Candidato de `auto` |
| --- | --- | --- |
| `auto` | Router recomendado, sin tools ni builders | No; nunca delega a un router |
| `country` | Atlas: consultar, crear y actualizar el catálogo Country | Sí |
| `language` | Léxico: consultar, crear y actualizar Language; no traducción | Sí |
| `person` | Nexo: consultar, crear y actualizar Person, con relaciones por IDs existentes | Sí |
| `default` | Guía Zuite original, sin tools | No |

Los especialistas mantienen sus prompts y tools originales; reciben `routing.eligible: true`, capacidades y ejemplos acotados a su entidad. El router y los cuatro agentes requieren usuario mediante `access.requireUser: true`. Esto no concede permisos CRUD ni sustituye la seguridad de los services.

Para incluir ayuda de conocimiento general, se necesita además el segundo opt-in:

```ts
await initializeAgent({
    router: true,
    includeGeneralAssistant: true,
    routingProvider: AiProviderFactory.instance('DeepSeek'),
    routingModel: 'deepseek-chat'
})
```

En ese caso `default` se configura como asistente general sin tools, sin acceso a datos del sistema, con metadata elegible, y se agrega a `candidateIdentifiers`. No es un fallback para permisos denegados, errores de clasificación ni pedidos multidominio. `includeGeneralAssistant: true` sin `router: true` no cambia la guía ni habilita routing.

Elegir las opciones durante el arranque, antes de servir requests. El registro es de singletons: repetir la inicialización no duplica agentes ni tools, pero no es una API para apagar routers o alternar modos en caliente; tampoco renombra descripciones de instancias ya creadas con `instance`.

## Configuración real de la API backend

`DraxAgentFactory.router(identifier, description, config)` registra explícitamente un router; rechaza colisiones con un especialista o con una descripción incompatible. `lookup(identifier)` consulta sin crear; `instance(identifier, description)` conserva la semántica histórica get-or-create y debe reservarse para identificadores controlados por el bootstrap, no por requests o modelos.

Además de `DraxAgentConfig`, la configuración del router admite:

| Campo | Comportamiento |
| --- | --- |
| `routingProvider?: IAIProvider` | Provider de clasificación; si falta, se resuelve al ejecutar el turno mediante el provider del agente/`AiProviderFactory` y su configuración (`AI_PROVIDER`) |
| `routingModel?: string` | Modelo de clasificación; no se propaga al especialista |
| `candidateIdentifiers?: string[]` | Allowlist opcional del registro, intersectada con elegibilidad y acceso |
| `routingHistoryLimit?: number` | Últimos 8 mensajes por defecto para clasificar |
| `specialistHistoryLimit?: number` | Últimos 12 mensajes por defecto como contexto delegado |

Ambos límites aceptan enteros de **0 a 100**, inclusive; `0` no envía historial. Son cantidades de mensajes, no de pares pregunta/respuesta. Se excluyen mensajes internos `system`. El especialista aplica además su propio `historyLimit`, si corresponde. `lastResolvedAgentIdentifier` es solo una señal de continuidad si sigue autorizado y en catálogo; no fija el destino y no impide cambiar de tema.

El router rechaza tools/builders no vacíos o dinámicos. En Zuite se pasan `tools: []` y `toolBuilders: []` explícitos y se marca `routing: {recommended: true}`. Su allowlist contiene `country`, `language`, `person`, y únicamente con el opt-in general, `default`.

La metadata opcional de cada agente es:

```ts
routing?: {
    eligible?: boolean
    enabled?: boolean
    capabilities?: string
    examples?: string[]
    recommended?: boolean
}
access?: {
    requireUser?: boolean
    requireTenant?: boolean
    permissions?: string[]
    authorize?: (ctx: {
        userId: string | null
        tenantId: string | null
        permissions?: readonly string[]
        authenticated?: boolean
    }) => boolean | Promise<boolean>
}
```

Solo son candidatos los especialistas con `eligible === true`, no deshabilitados, con capacidades no vacías, incluidos en la allowlist cuando existe, y autorizados para el contexto backend. `enabled: false` también impide acceso manual. `recommended` es una sugerencia para la UI, no una autorización.

Ejemplo opcional de política adicional configurada **en backend**, después de inicializar los agentes:

```ts
DraxAgentFactory.lookup('person')!.configure({
    access: {
        requireUser: true,
        requireTenant: true,
        permissions: ['demo:person:use'],
        authorize: ctx => ctx.authenticated === true
    }
})
```

`demo:person:use` es un permiso ilustrativo: debe registrarse y asignarse en el RBAC de la aplicación si se adopta. Se exigen todos los permisos enumerados; `authorize` debe devolver `true` y sus excepciones deniegan acceso. `configure` reemplaza el objeto `access`, no hace merge profundo. La demo solo exige usuario y no asigna este permiso. No conceder acceso por texto como «soy administrador», por un prompt ni por una decisión del clasificador.

## Clasificación, catálogo y datos enviados

El clasificador devuelve un objeto raíz estricto, con todos los campos requeridos y los dos campos anulables explícitos:

```ts
{
    action: 'delegate' | 'clarify' | 'unsupported',
    agentIdentifier: null | string,
    message: null | string,
    requiresMultipleSpecialists: boolean
}
```

- `delegate`: un único destino del catálogo y `message: null`.
- `clarify` o `unsupported`: `agentIdentifier: null` y un mensaje breve no vacío.
- `requiresMultipleSpecialists: true`: pide separar el pedido, sin ejecución parcial, incluso si la acción declarada era delegar.
- JSON inválido, campos extra, combinaciones inconsistentes o destino fuera del catálogo no habilitan una ejecución.

El catálogo de clasificación contiene **solo metadata**: `identifier`, `description`, `capabilities` y ejemplos opcionales. Nunca incluye prompts internos, tools, schemas de entidades ni registros. Se construye con el acceso actual y el destino se revalida después de clasificar y otra vez al iniciar su ejecución. La elegibilidad no reemplaza esa autorización.

La clasificación recibe texto del mensaje, partes de texto adicionales, historial textual reciente y descriptores mínimos: cantidad de imágenes y, para archivos, MIME/tamaño. No se le pasan URLs, nombres/rutas de adjuntos ni contenido visual/binario mediante los campos de adjuntos; las data URI del texto se sustituyen por un marcador. Esto no es un sanitizador general de secretos o URLs escritos por el usuario en el texto. Memoria y knowledge base no se usan para clasificar. Si el texto no permite elegir, debe pedir una descripción textual; no puede afirmar que vio un archivo.

El especialista recibe **el mensaje original**, no una reformulación del clasificador, y conserva `userImages`, `userContent`, `inputFiles`, memoria y knowledge base originales para su turno. Conserva su propio provider/model: no recibe `routingModel` ni un override de modelo enviado para el router. La interpretación de archivos, visión y tools depende de su provider e infraestructura, no de la existencia del router.

Ni el contenido de registros ni instrucciones incrustadas en adjuntos pueden otorgar privilegios. Validar tools y services, permisos por operación/campo, filtros de tenant y tratamiento de datos sensibles sigue siendo imprescindible. `BuilderTool` llama al service: un prompt que exige `tenantId`, oculta `secret` o limita campos no constituye una frontera de seguridad.

## HTTP y frontend

Rutas existentes:

- `GET /api/ai/agent`: `{agents: [{identifier, description, type?, routing?}], recommendedAgentIdentifier?}`. Filtra agentes no autorizados/deshabilitados. Los agentes manuales legacy sin metadata conservan entradas simples; no se publican callbacks de acceso, providers ni prompts.
- `POST /api/ai/agent/session`: `{identifier?, sessionId?}`.
- `POST /api/ai/agent/message`: `{identifier?, sessionId?, message, ...}` y campos multimodales admitidos por el controlador.

Enviar `identifier: 'auto'` para routing. Si se omite, el controlador conserva su destino por defecto (`default`, salvo configuración explícita); registrar un router recomendado no cambia por sí solo ese default HTTP.

**Cambio de seguridad respecto del comportamiento anterior:** los identificadores de agente desconocidos en HTTP se resuelven por `lookup` y se rechazan con `AGENT_NOT_FOUND`/404; nunca crean agentes implícitos. Los IDs de identidad/scope del body (`userId`, `tenantId`) se ignoran **siempre**, también sin RBAC o con `permission: false`; no son un fallback de autenticación. `identifier`/`sessionId` sí siguen siendo selectores de agente/conversación. `accessContext`, permisos y estado autenticado se derivan exclusivamente del backend/RBAC, no del body. La autorización global de las rutas es independiente de la autorización de cada agente.

Las respuestas de mensaje conservan `agentIdentifier`, `sessionId`, `message`, `output`, `tokens`, `inputTokens`, `outputTokens`, `time`, con `navigationPath?` y `audio?`. Los campos adicionales son opcionales para compatibilidad:

| Campo | Significado |
| --- | --- |
| `resolvedAgentIdentifier?` | Especialista efectivo; `agentIdentifier` sigue siendo `auto` |
| `correlationId?` | UUID del turno generado por backend para correlacionar clasificación, ejecución, mensajes y errores |
| `error?` | `{code, message, statusCode?, stage?, operationMayHaveCompleted?}` |
| `metrics?` | Métricas numéricas de clasificación/ejecución y tiempo total |

Las métricas del router incluyen `routingTime`, `executionTime`, `totalTime`, `routingTokens`, `routingInputTokens`, `routingOutputTokens`, `executionTokens`, `executionInputTokens`, `executionOutputTokens`; tiempos en milisegundos. En respuestas exitosas los tokens totales suman clasificación y ejecución. Si un provider falla sin devolver usage, **no se puede medir el consumo que pudo haber ocurrido**; cero usage reportado no implica costo cero. No se prometen totales completos para ejecuciones fallidas ni inclusión del costo TTS en los tokens LLM.

Un resultado con `.error` produce HTTP no-2xx, no un éxito silencioso. Cuando el turno puede persistirse, se conserva la conversación con el mensaje honesto de error; la UI debe leer también el body de la respuesta fallida, conservar `sessionId` e historial y mostrar la referencia de correlación. Errores tempranos de acceso/sesión pueden devolver un body reducido sin resultado de turno.

`DraxAgent` y `DraxAgentExpress` aceptan:

```vue
<DraxAgent
  initial-agent-identifier="auto"
  :allow-manual-selection="true"
  :show-resolved-agent="true"
/>
```

- `initialAgentIdentifier?: string`: selección explícita inicial.
- `allowManualSelection = true`: permite selección manual; ocultarla no es un control de acceso.
- `showResolvedAgent = false`: opt-in para mostrar quién atendió el turno.

La selección y el envío esperan a que termine `listAgents`; sin selección explícita se prioriza el router recomendado, después `default` y luego el primer agente disponible. Se conserva el fallback legacy si falla el listado. No se debe cambiar el selector a `resolvedAgentIdentifier`: la conversación sigue perteneciendo a `auto`. Una selección manual distinta inicia otra conversación, no reutiliza la sesión del router.

## Sesiones, persistencia y concurrencia

Se agregan campos opcionales de sesión `ownerAgentIdentifier`, `conversationType` (`specialist` o `router`) y `lastResolvedAgentIdentifier`. Los mensajes pueden guardar `resolvedAgentIdentifier`, `correlationId`, `userContent` e `inputFiles`. El historial canónico conserva mensaje original y respuesta visible, no el JSON interno de clasificación; los descriptores de archivo no implican replay de su binario en el historial.

Una sesión nueva tiene propietario agente/tipo. La conversación del router es única: el especialista ejecuta un turno sin adoptar su `sessionId` como sesión propia ni persistir una conversación paralela. Se comprueba igualdad exacta de usuario y tenant; `null`/ausente representan el scope nulo, **no** un comodín para otro usuario o tenant.

Las sesiones legacy sin owner/tipo solo pueden continuar por el camino manual de especialistas. No existe adopción implícita por un router: para pasar a `auto` se inicia una sesión nueva. No rellenar owners históricos por inferencia. Registros parcialmente etiquetados no deben tratarse como legacy para saltar controles.

El CRUD HTTP de `AgentSession` no permite editar ni eliminar conversaciones gestionadas o reclamadas por un agente: historial e identidad los escribe únicamente el backend conversacional. Tampoco permite crear/importar ownership, reasignar `sessionId` ni importar sobre una sesión existente/protegida. Los registros legacy no reclamados conservan sus operaciones anteriores, salvo la identidad inmutable y los campos reservados. Este endurecimiento impide eludir al router desde el CRUD; las tareas de reconciliación o eliminación de sesiones gestionadas requieren una operación administrativa backend coordinada, no modificar estos campos desde el cliente.

- **SQLite:** `AgentSessionServiceFactory` llama al `build()` del repositorio. El builder comprueba columnas y agrega las faltantes con `ALTER TABLE`: migración aditiva e idempotente para `ownerAgentIdentifier`, `conversationType`, `lastResolvedAgentIdentifier`. Las filas antiguas quedan con `NULL`, expuesto como campo opcional. Respaldar y verificar sobre una copia de la DB antes de desplegar; compilar TypeScript no ejecuta esta migración.
- **MongoDB:** campos opcionales aditivos del schema, sin backfill obligatorio ni conversión destructiva de documentos antiguos.
- **Concurrencia:** lock, reservas CRUD, claims de ownership y marcas de persistencia indeterminada son **process-local**, por `sessionId`. Un segundo turno u otra mutación concurrente se rechaza con `SESSION_BUSY`/409; no se encola ni reintenta. El CRUD utiliza una fachada local del servicio que adquiere la reserva compartida, revalida bajo ella y espera la escritura completa; las importaciones también la usan por fila, preservando su contrato de error por fila. No modifica el singleton del servicio. `clearSessions()` limpia historial local, no elimina claims ni marcas de incertidumbre.

Los IDs persistidos duplicados se rechazan con `SESSION_CONFLICT`, sin elegir arbitrariamente un registro. Los repositorios existentes no imponen unicidad global de `sessionId`: las reservas evitan colisiones entre los caminos core/CRUD de este proceso, pero no reemplazan una restricción transaccional para escritores externos o múltiples réplicas. No importar conversaciones mientras están siendo utilizadas.

**Restricción de despliegue:** usar una sola instancia propietaria que atienda estas sesiones, o implementar coordinación/lock distribuido externo que cubra ownership, escritura e incertidumbre. Estos mecanismos en memoria no garantizan exclusión entre réplicas, workers o procesos, ni sobreviven reinicios. Compartir SQLite/MongoDB o usar afinidad de sesiones por sí solo no crea un lock distribuido. No desplegar varias réplicas suponiendo protección que esta implementación no ofrece.

## Errores, audio y operaciones indeterminadas

No hay retry ni fallback automático ante un provider fallido, decisión inválida o especialista denegado. Entre los errores están `ROUTER_NO_CANDIDATES`, `ROUTING_PROVIDER_FAILED`, `ROUTING_DECISION_INVALID`, `ROUTING_TARGET_DENIED`, `SPECIALIST_EXECUTION_FAILED` y `ROUTER_AUDIO_FAILED`.

Antes de delegar se puede afirmar que no se ejecutó ninguna operación de negocio. Después de una falla del especialista no es honesto afirmar rollback: una tool pudo haberse completado antes del error. Se devuelve `operationMayHaveCompleted: true` cuando corresponde y se solicita verificar el estado antes de volver a pedir la operación.

Si el turno ya se ejecutó pero falla su persistencia, `SESSION_PERSISTENCE_INDETERMINATE` bloquea la continuación en ese proceso; hay que reconciliar el resultado y la persistencia antes de continuar. El error conserva el `sessionId` solo después de validar su propietario/scope, incluso en el primer mensaje, junto con la correlación y la advertencia de incertidumbre. La UI conserva ese ID y bloquea nuevos envíos automáticos o manuales mientras el resultado sea indeterminado; abrir otra sesión es una acción explícita, no un retry ni una reconciliación. No reiniciar el proceso para «solucionarlo» ni reenviar escrituras automáticamente: el reinicio elimina la protección local, no deshace operaciones.

La clasificación usa `audioResponse: false`. En modo router, el especialista también termina su llamada con audio desactivado; una vez disponibles su texto, navegación y usage, el router sintetiza únicamente ese texto final mediante `PromptAudioService`. No hay otra llamada LLM ni reformulación. La misma infraestructura genera audio para aclaraciones/límites/errores, nunca para el JSON de clasificación.

Si TTS falla después de un turno exitoso, se conservan texto, navegación, responsable y todos sus tokens; se informa `ROUTER_AUDIO_FAILED`, etapa `audio`, sin repetir tools ni síntesis. Si ya existía un error primario, se conserva y se agrega `audioFailed: true`. La UI reutiliza el audio recibido aun en respuestas HTTP no-2xx y no lo vuelve a sintetizar ante esos indicadores de fallo. Las métricas distinguen `routingTime`, `executionTime` y `audioTime`; `time`/`metrics.totalTime` de `sendMessage` incluyen resolución y persistencia de la sesión. Los errores de provider que no devuelven usage no permiten reconstruir sus tokens consumidos.

Reutiliza los providers/voces/configuración TTS existentes y las opciones de voz/navegador en la UI. Registrar el router no configura TTS ni demuestra compatibilidad de audio. Una falla de audio no indica rollback de una operación de negocio.

## Build y validación

Desde la raíz, los scripts reales disponibles para actualizar artefactos y verificar son:

```sh
npm run tsc --workspace=@drax/ai-share
npm run tsc --workspace=@drax/ai-back
npm run tsc --workspace=@drax/ai-front
npm run tsc --workspace=@drax/zuite-back -- --noEmit
npm run type-check --workspace=@drax/ai-vue
./node_modules/.bin/vitest run packages/zuite/zuite-back/test/setup/InitializeAgent.test.ts
npm --prefix docs run docs:build
```

`@drax/ai-back` publica runtime en `dist/index.js` y tipos en `types/index.d.ts`: los exports y artefactos deben estar actualizados antes de validar al consumidor. Si falta `DraxAgentFactory.router` en sus tipos públicos, el type-check de Zuite falla aunque exista en `src`; no se debe ocultar mediante casts ni resolver con imports internos en producción. Los tests de esta demo usan un mock parcial del export público que apunta a la factory real de `src`, para poder verificarla durante el build coordinado; los demás exports permanecen públicos. Esto no sustituye validar el paquete compilado.

Para verificar únicamente el feature frontend sin mezclar diagnósticos de otros componentes:

```sh
npm run test:unit --workspace=@drax/ai-vue -- --run
npm exec --offline -- vue-tsc --noEmit -p packages/ai/ai-vue/tsconfig.agent-tests.json
```

Se verificaron builds de `ai-share`/`ai-back`, typecheck de Zuite y build de documentación. El typecheck completo de `ai-front` está bloqueado por `ImportMeta.env` en `common-front`; el de `ai-vue` también encuentra errores ajenos al feature en comboboxes, configuración e Identity/Media. El chequeo acotado anterior pasa. Estos errores no se corrigieron como parte del router.

El script `test` de Zuite es actualmente `test`, no Vitest; usar el comando explícito anterior. Para compilar Zuite existe `npm run tsc --workspace=@drax/zuite-back` (emite al `dist` raíz). Su script `build` además borra `../dist` y copia GraphQL/configuración; no es necesario para estas pruebas aisladas. Para la documentación, `docs:build` pertenece al package de `docs`, no al workspace raíz.

Los tests de `InitializeAgent.test.ts` preservan los casos previos y verifican IDs, ausencia de metadata nueva sin opt-in, catálogo autorizado, guía intacta, asistente general explícito sin tools, aislamiento de tools, provider/model diferidos y singletons. Usan services simulados y un provider falso; no necesitan DB, secretos ni llamadas a red. No prueban calidad semántica con un LLM real.

### Validación manual con proveedor configurado: pendiente

**Debe realizarse antes de habilitar en producción.** No se han ejecutado inferencias reales como parte de esta integración ni se afirma que los modelos mencionados hayan sido probados. Usar un entorno de prueba, cuentas/tenants separados y datos sintéticos; registrar provider, modelo, versión, resultados, latencia, usage/costo y errores, sin guardar secretos.

| Caso representativo | Comprobar |
| --- | --- |
| «Listá los países registrados» | Resuelve `country`, usa tools Country, no conocimiento general como datos del catálogo |
| «Listá los idiomas registrados» | Resuelve `language`, sin tools Country/Person |
| «Buscá la ficha de Ana de prueba» | Resuelve `person`, aplica permisos, tenant y protección de campos en backend |
| «Actualizá ese registro» sin contexto suficiente | Aclaración sin escrituras |
| Seguimiento: «Mostrame los siguientes» | Usa contexto reciente sin inventar IDs ni asumir orden de negocio |
| Cambio de tema de países a idiomas | Cambia de especialista, pero mantiene selector/sesión en `auto` |
| «Creá un país y una persona vinculada» | Detecta multidominio, pide separar, ninguna acción parcial |
| Usuario sin permiso, tenant ausente o permiso revocado durante clasificación | Excluye/deniega destino, sin fuga de datos ni fallback permisivo |
| Conocimiento general, con y sin `includeGeneralAssistant` | Solo con segundo opt-in delega al `default` general; no accede a registros |
| Imagen/archivo sin texto descriptivo | Router pide contexto textual; no finge haber leído contenido |
| Archivo con descripción textual suficiente | Solo metadata mínima al clasificador, adjunto original al especialista compatible |
| IDs falsos en body, destino desconocido, scope nulo/ajeno | Ignora identidad del body, 404 sin crear agente, rechaza acceso cruzado |
| JSON inválido, provider caído, tool fallida y falla después de escritura | HTTP no-2xx y mensaje honesto, conserva conversación cuando puede persistir, sin retry automático |
| Dos mensajes concurrentes y sesión legacy | 409 dentro del proceso; legacy manual sin adopción por `auto` |
| Audio activado y falla TTS | Solo texto visible al TTS, error explícito sin afirmar rollback |

La clasificación agrega una llamada, latencia y costo, y comparte texto/historial/metadata con el proveedor de routing; la ejecución comparte el contenido original y contexto autorizado con el proveedor especialista. Revisar políticas de retención, residencia, consentimiento, logs y envío de datos personales. Restringir adjuntos, memoria y KB a lo necesario; no usar datos sensibles reales para evaluar routing. Verificar structured output, tools, visión y TTS por combinación concreta de provider/modelo, sin deducir soporte por el nombre del modelo.
