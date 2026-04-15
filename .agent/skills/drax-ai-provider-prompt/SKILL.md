---
name: drax-ai-provider-prompt
description: Explica como usar AiProviderFactory e IAIProvider en Drax para ejecutar prompts completos de forma agnostica al proveedor, incluyendo systemPrompt, userInput, userContent, userImages, history, memory, knowledgeBase, jsonSchema, zodSchema, model y metadatos de operacion. Usar cuando el usuario pida ejemplos, documentacion o implementaciones basadas en AiProviderFactory, IAIProvider, AIGenericController, AICrudController o AiTestController.
---

# Drax AI Provider Prompt

Documentar y ejemplificar siempre a partir de la API publica real del repositorio.

Fuentes principales para esta skill:

- `packages/ai/ai-back/src/factory/AiProviderFactory.ts`
- `packages/ai/ai-back/src/interfaces/IAIProvider.ts`
- `packages/zuite/zuite-back/src/modules/base/controllers/AiTestController.ts`
- `packages/ai/ai-back/src/controllers/AIGenericController.ts`
- `packages/ai/ai-back/src/controllers/AICrudController.ts`

## Idea central

La entrada recomendada para consumir AI en el proyecto es `AiProviderFactory.instance()`.

Esa factory devuelve un objeto que cumple la interfaz `IAIProvider`.

La skill debe explicarlo asi:

- la aplicacion consume una abstraccion estable
- el codigo de negocio no deberia depender de un proveedor concreto
- el proveedor real puede cambiar en el futuro sin cambiar el contrato de uso
- el punto importante no es la implementacion interna sino la interfaz `IAIProvider`

Uso base:

```ts
import { AiProviderFactory } from "@drax/ai-back";

const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: "Sos un asistente tecnico.",
  userInput: "Explicame como funciona el modulo AI.",
});
```

## Que retorna AiProviderFactory

`AiProviderFactory.instance()` retorna un `IAIProvider`.

La interfaz publica actual es:

```ts
interface IAIProvider {
  prompt(input: IPromptParams): Promise<IPromptResponse>
}
```

Esto significa:

- la forma correcta de programar contra AI en Drax es depender de `IAIProvider`
- el consumidor solo necesita conocer `prompt(input)`
- cualquier logica especifica del proveedor debe tratarse como detalle interno

## Flujo correcto

Cuando te pidan usar o explicar esta API:

1. Mostrar `AiProviderFactory.instance()` como puerta de entrada.
2. Explicar que el valor retornado implementa `IAIProvider`.
3. Explicar que el trabajo importante ocurre en `provider.prompt({...})`.
4. Documentar solo los parametros que existen en `IPromptParams`.
5. No atar la explicacion a un proveedor concreto.
6. Si el caso parte de un controller, mantener el ejemplo igual de generico.
7. Si se necesita salida estructurada, usar `zodSchema` o `jsonSchema` segun el caso.
8. Si se necesita soportar un futuro multiproveedor, insistir en no importar factories concretas desde codigo de aplicacion.

## Contrato de entrada: IPromptParams

La firma real viene de `IAIProvider.ts`.

### Obligatorio

- `systemPrompt: string`
  - Es el unico campo obligatorio de la interfaz.

### Input principal

- `userInput?: string`
  - Texto principal del usuario.

- `userImages?: IPromptImage[]`
  - Lista de imagenes del usuario.
  - Tipo:
    ```ts
    {
      url: string;
      detail?: "auto" | "low" | "high";
    }
    ```

- `userContent?: IPromptContentPart[]`
  - Contenido multimodal mas controlado.
  - Tipo:
    ```ts
    type IPromptContentPart =
      | { type: "text"; text: string }
      | { type: "image"; imageUrl: string; detail?: "auto" | "low" | "high" };
    ```

### Contexto conversacional

- `history?: IPromptMessage[]`
  - Historial conversacional previo.
  - Tipo:
    ```ts
    {
      role: "user" | "assistant" | "system";
      content: string | IPromptContentPart[];
    }
    ```

- `memory?: IPromptMemory[]`
  - Pares clave/valor para contexto adicional.
  - Tipo:
    ```ts
    {
      key: string;
      value: string;
    }
    ```

- `memoryHeader?: string | "[MEMORY]" | "[MEMORIA]"`
  - Header opcional para presentar la memoria.

- `knowledgeBase?: string[]`
  - Fragmentos de conocimiento a inyectar en el prompt.

- `knowledgeBaseHeader?: string | "[KNOWLEDGE BASE]" | "[BASE DE CONOCIMIENTO]"`
  - Header opcional para presentar la base de conocimiento.

### Archivos y contenido auxiliar

- `inputFiles?: Array<{ filename?, filepath?, size?, mimetype?, url? }>`
  - Metadata de archivos asociados al prompt.
  - La interfaz permite enviarlos, pero no define por si misma como cada proveedor los interpreta.

### Salida estructurada

- `zodSchema?: ZodSchema<any>`
  - Para forzar una estructura validable desde TypeScript.

- `jsonSchema?: object`
  - Para solicitar una salida estructurada con un schema serializable.

### Seleccion de modelo y trazabilidad

- `model?: string`
  - Seleccion opcional de modelo.
  - La interfaz lo soporta, pero la resolucion exacta depende del proveedor concreto.

- `operationTitle?: string`
- `operationGroup?: string`
- `ip?: string`
- `userAgent?: string`
- `tenant?: string | null`
- `user?: string | null`
  - Metadata operacional y de trazabilidad.

## Contrato de salida: IPromptResponse

La respuesta publica es:

```ts
interface IPromptResponse {
  output: any,
  tokens: number,
  inputTokens: number,
  outputTokens: number,
  time: number
}
```

Explicarlo asi:

- `output` contiene la salida generada por el proveedor
- `tokens`, `inputTokens` y `outputTokens` exponen consumo
- `time` representa el tiempo de la operacion

No asumir mas que eso.

## Como usarlo correctamente

### 1. Prompt basico

```ts
import { AiProviderFactory } from "@drax/ai-back";

const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: [
    "Sos un asistente tecnico del framework Drax.",
    "Responde en espanol.",
    "Se preciso y no inventes APIs."
  ].join("\n"),
  userInput: "Explicame para que sirve AiProviderFactory.",
  operationTitle: "describe-ai-provider-factory",
  operationGroup: "docs-ai",
  ip: request.ip,
  userAgent: request.headers["user-agent"],
  tenant: request.rbac?.tenantId ?? null,
  user: request.rbac?.userId ?? null,
});
```

### 2. Prompt con history, memory y knowledge base

```ts
const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: "Sos un analista funcional y tecnico.",
  history: [
    { role: "user", content: "Necesito entender el modulo AI." },
    { role: "assistant", content: "Mostrame el contexto del caso." },
  ],
  userInput: "Explicalo para un desarrollador backend.",
  memory: [
    { key: "idioma", value: "es-AR" },
    { key: "audiencia", value: "desarrollador backend senior" },
  ],
  knowledgeBase: [
    "AiProviderFactory es la puerta de entrada publica del modulo AI.",
    "El consumidor debe depender de IAIProvider y no de una implementacion concreta.",
  ],
  operationTitle: "backend-ai-explanation",
  operationGroup: "docs-ai",
});
```

### 3. Prompt multimodal simple

```ts
const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: "Analiza la imagen y devuelve observaciones tecnicas.",
  userInput: "Describe el error visible en la captura.",
  userImages: [
    {
      url: "https://example.com/screenshot.png",
      detail: "high",
    },
  ],
  operationTitle: "image-analysis",
  operationGroup: "support-ai",
});
```

### 4. Prompt multimodal avanzado

```ts
const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: "Compara ambas imagenes y responde en formato breve.",
  userContent: [
    { type: "text", text: "Primero analiza la version actual." },
    { type: "image", imageUrl: "https://example.com/current.png", detail: "high" },
    { type: "text", text: "Ahora compara con la version anterior." },
    { type: "image", imageUrl: "https://example.com/previous.png", detail: "high" },
  ],
  operationTitle: "compare-ui-images",
  operationGroup: "design-review",
});
```

### 5. Salida estructurada con zod

Patron alineado con `AICrudController`.

```ts
import { z } from "zod";

const provider = AiProviderFactory.instance();

const responseSchema = z.object({
  summary: z.string(),
  risks: z.array(z.string()).default([]),
  decision: z.enum(["approve", "reject", "needs-review"]),
});

const response = await provider.prompt({
  systemPrompt: "Analiza la propuesta y responde solo con la estructura requerida.",
  userInput: "Evaluar si el cambio puede salir a produccion hoy.",
  zodSchema: responseSchema,
  operationTitle: "release-decision",
  operationGroup: "release-ai",
});

const parsed =
  typeof response.output === "string"
    ? responseSchema.parse(JSON.parse(response.output))
    : responseSchema.parse(response.output);
```

### 6. Salida estructurada con jsonSchema

```ts
const provider = AiProviderFactory.instance();

const response = await provider.prompt({
  systemPrompt: "Devuelve una respuesta JSON estricta.",
  userInput: "Resume el incidente.",
  jsonSchema: {
    type: "json_schema",
    json_schema: {
      name: "incident_summary",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          actions: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["title", "severity", "actions"]
      }
    }
  },
  operationTitle: "incident-summary",
  operationGroup: "ops-ai",
});
```

## Uso basado en controllers

### AIGenericController

`AIGenericController` recibe un payload validado y lo delega a `AiProviderFactory.instance()`.

Esto lo vuelve un buen ejemplo de integracion generica:

- valida entrada
- construye `IPromptParams`
- resuelve `IAIProvider`
- ejecuta `provider.prompt(...)`

### AICrudController

`AICrudController` muestra el patron recomendado cuando se necesita salida estructurada:

- construir un `zodSchema`
- invocar `provider.prompt(...)`
- parsear el `output`

### AiTestController

`AiTestController` es util para pruebas manuales porque:

- recibe los campos de prompt desde request
- puede transformar `inputFiles` en `userImages`
- delega finalmente a `AiProviderFactory.instance()`

Al documentarlo, la explicacion correcta es:

- el controller sigue siendo generico respecto del proveedor
- el contrato de integracion sigue siendo `IAIProvider`
- cualquier detalle especifico del motor real queda escondido detras de la factory

## Como explicarlo al equipo

Usar esta formula:

1. `AiProviderFactory.instance()` es la puerta de entrada publica del modulo AI.
2. Esa factory retorna un objeto que implementa `IAIProvider`.
3. El codigo consumidor debe depender de `IAIProvider`, no de una implementacion concreta.
4. La operacion principal es `prompt(input: IPromptParams): Promise<IPromptResponse>`.
5. La API ya esta preparada para ocultar el proveedor real y hacer transparente un futuro escenario multiproveedor.

## Que no hay que inventar

- No afirmar que el consumidor debe importar una factory concreta del proveedor.
- No acoplar explicaciones a una implementacion interna especifica.
- No prometer features del proveedor que no aparezcan en `IAIProvider` o en los controllers que usan esta interfaz.
- No asumir como se resuelven `model`, `userImages`, `jsonSchema` o `zodSchema` internamente mas alla de lo que expone el contrato publico.
- No mostrar ejemplos que rompan la abstraccion multiproveedor.
