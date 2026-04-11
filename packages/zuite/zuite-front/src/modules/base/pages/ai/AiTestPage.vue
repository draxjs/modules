<script setup lang="ts">
import { computed, ref } from "vue";
import AiTestProvider from "@/modules/base/providers/AiTestProvider";
import { CrudFormField } from "@drax/crud-vue";
import type { IEntityCrudField } from "@drax/crud-share";

type JsonFieldKey =
  | "historyJson"
  | "memoryJson"
  | "knowledgeBaseJson"
  | "userContentJson"
  | "jsonSchemaJson";

type VisionImageMode = "url" | "base64";
type VisionDetail = "auto" | "low" | "high";

const formRef = ref()
const loading = ref(false)
const error = ref<string | null>(null)
const response = ref<any | null>(null)

const form = ref({
  systemPrompt: "Sos un asistente útil y preciso.",
  userInput: "",
  imageFile: {
    filename: "",
    filepath: "",
    size: 0,
    mimetype: "",
    url: "",
  },
  visionImageMode: "base64" as VisionImageMode,
  visionDetail: "auto" as VisionDetail,
  model: "",
  operationTitle: "Prueba manual desde AiTestPage",
  operationGroup: "AiTestPage",
  memoryHeader: "[MEMORIA]",
  knowledgeBaseHeader: "[BASE DE CONOCIMIENTO]",
  historyJson: "",
  memoryJson: "",
  knowledgeBaseJson: "",
  userContentJson: "",
  jsonSchemaJson: "",
})

const inputErrors = ref<Record<string, string[]>>({})

const rules = {
  required: (value: string) => !!value?.trim() || "Campo requerido",
}

const examples = {
  history: `[
  {
    "role": "assistant",
    "content": "Hola, ¿en qué puedo ayudarte?"
  }
]`,
  memory: `[
  {
    "key": "nombre",
    "value": "Carlos"
  }
]`,
  knowledgeBase: `[
  "La empresa atiende de lunes a viernes de 9 a 18 hs.",
  "El soporte prioritario demora menos de 24 horas."
]`,
  userContent: `[
  {
    "type": "text",
    "text": "Describe la imagen"
  },
  {
    "type": "image",
    "imageUrl": "https://example.com/image.jpg",
    "detail": "auto"
  }
]`,
  jsonSchema: `{
  "type": "json_schema",
  "json_schema": {
    "name": "response",
    "schema": {
      "type": "object",
      "properties": {
        "answer": { "type": "string" }
      },
      "required": ["answer"],
      "additionalProperties": false
    }
  }
}`,
}

const aiTestEntity = {
  name: "AiTest",
} as any

const imageField: IEntityCrudField = {
  name: "imageFile",
  type: "fullFile",
  label: "Imagen",
  default: {},
  preview: true,
  previewHeight: "220px",
  prependInnerIcon: "mdi-paperclip",
}

const hasUploadedImage = computed(() => {
  return !!form.value.imageFile?.filepath
})

const imagePreviewUrl = computed(() => {
  return form.value.imageFile?.url || ""
})

const responseOutput = computed(() => {
  if (!response.value) {
    return ""
  }

  const output = response.value.output
  if (typeof output === "string") {
    return output
  }

  return JSON.stringify(output, null, 2)
})

function setExample(field: JsonFieldKey, value: string) {
  form.value[field] = value
}

function parseOptionalJson(field: JsonFieldKey, label: string) {
  const raw = form.value[field]?.trim()
  if (!raw) {
    inputErrors.value[field] = []
    return undefined
  }

  try {
    const parsed = JSON.parse(raw)
    inputErrors.value[field] = []
    return parsed
  } catch {
    inputErrors.value[field] = [`${label} debe ser JSON válido`]
    throw new Error(`${label} debe ser JSON válido`)
  }
}

async function submit() {
  error.value = null
  response.value = null
  inputErrors.value = {}

  const validation = await formRef.value?.validate()
  if (validation && !validation.valid) {
    return
  }

  loading.value = true

  try {
    const payload = {
      systemPrompt: form.value.systemPrompt,
      userInput: form.value.userInput || undefined,
      inputFiles: hasUploadedImage.value ? [form.value.imageFile] : undefined,
      visionImageMode: hasUploadedImage.value ? form.value.visionImageMode : undefined,
      visionDetail: hasUploadedImage.value ? form.value.visionDetail : undefined,
      model: form.value.model || undefined,
      operationTitle: form.value.operationTitle || undefined,
      operationGroup: form.value.operationGroup || undefined,
      memoryHeader: form.value.memoryHeader || undefined,
      knowledgeBaseHeader: form.value.knowledgeBaseHeader || undefined,
      history: parseOptionalJson("historyJson", "History"),
      memory: parseOptionalJson("memoryJson", "Memory"),
      knowledgeBase: parseOptionalJson("knowledgeBaseJson", "Knowledge base"),
      userContent: parseOptionalJson("userContentJson", "User content"),
      jsonSchema: parseOptionalJson("jsonSchemaJson", "JSON schema"),
    }

    response.value = await AiTestProvider.instance.prompt(payload)
  } catch (e: any) {
    error.value = e?.message ?? "No se pudo ejecutar el prompt"
  } finally {
    loading.value = false
  }
}

function resetForm() {
  error.value = null
  response.value = null
  inputErrors.value = {}
  form.value = {
    systemPrompt: "Sos un asistente útil y preciso.",
    userInput: "",
    imageFile: {
      filename: "",
      filepath: "",
      size: 0,
      mimetype: "",
      url: "",
    },
    visionImageMode: "base64",
    visionDetail: "auto",
    model: "",
    operationTitle: "Prueba manual desde AiTestPage",
    operationGroup: "AiTestPage",
    memoryHeader: "[MEMORIA]",
    knowledgeBaseHeader: "[BASE DE CONOCIMIENTO]",
    historyJson: "",
    memoryJson: "",
    knowledgeBaseJson: "",
    userContentJson: "",
    jsonSchemaJson: "",
  }
}
</script>

<template>
  <v-container class="py-6" fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold">AI Test</h1>
            <p class="text-medium-emphasis mb-0">
              Formulario para probar `@drax/ai-back` con `OpenAiProvider`.
            </p>
          </div>
          <div class="d-flex ga-2">
            <v-btn variant="outlined" :disabled="loading" @click="resetForm">
              Limpiar
            </v-btn>
            <v-btn color="primary" :loading="loading" @click="submit">
              Ejecutar prompt
            </v-btn>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="7">
        <v-card rounded="lg" variant="outlined">
          <v-card-text>
            <v-form ref="formRef">
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.systemPrompt"
                    label="System prompt"
                    :rules="[rules.required]"
                    rows="5"
                    auto-grow
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.userInput"
                    label="User input"
                    rows="4"
                    auto-grow
                    variant="outlined"
                    hint="Si cargás `userContent`, este texto pasa a ser opcional."
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12">
                  <v-card variant="tonal" rounded="lg" class="pa-4">
                    <div class="text-subtitle-1 font-weight-medium mb-3">Vision</div>
                    <v-row>
                      <v-col cols="12" md="6">
                        <crud-form-field
                          v-model="form.imageFile"
                          :entity="aiTestEntity"
                          :field="imageField"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                          v-model="form.visionImageMode"
                          label="Modo de imagen"
                          :items="[
                            { title: 'Base64', value: 'base64' },
                            { title: 'URL publica', value: 'url' }
                          ]"
                          variant="outlined"
                          :disabled="!hasUploadedImage"
                          hint="En local usá base64. URL requiere una URL absoluta accesible por OpenAI."
                          persistent-hint
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                          v-model="form.visionDetail"
                          label="Detalle de imagen"
                          :items="[
                            { title: 'Auto', value: 'auto' },
                            { title: 'Low', value: 'low' },
                            { title: 'High', value: 'high' }
                          ]"
                          variant="outlined"
                          :disabled="!hasUploadedImage"
                        />
                      </v-col>

                      <v-col cols="12" v-if="hasUploadedImage">
                        <v-alert type="info" variant="tonal">
                          Se enviará el archivo cargado usando modo <strong>{{ form.visionImageMode }}</strong>.
                          Archivo: {{ form.imageFile.filename }}.
                        </v-alert>
                      </v-col>

                      <v-col cols="12" v-if="hasUploadedImage && imagePreviewUrl">
                        <v-img :src="imagePreviewUrl" max-height="220" class="rounded-lg border-thin" cover />
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.model"
                    label="Model"
                    variant="outlined"
                    hint="Opcional. Si queda vacío usa el modelo configurado."
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.operationTitle"
                    label="Operation title"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.operationGroup"
                    label="Operation group"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.memoryHeader"
                    label="Memory header"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.knowledgeBaseHeader"
                    label="Knowledge base header"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel title="History (JSON)">
                      <v-expansion-panel-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="text-caption text-medium-emphasis">Array de mensajes previos.</span>
                          <v-btn size="small" variant="text" @click="setExample('historyJson', examples.history)">
                            Cargar ejemplo
                          </v-btn>
                        </div>
                        <v-textarea
                          v-model="form.historyJson"
                          label="History JSON"
                          rows="8"
                          auto-grow
                          variant="outlined"
                          :error-messages="inputErrors.historyJson"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Memory (JSON)">
                      <v-expansion-panel-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="text-caption text-medium-emphasis">Array de pares clave/valor.</span>
                          <v-btn size="small" variant="text" @click="setExample('memoryJson', examples.memory)">
                            Cargar ejemplo
                          </v-btn>
                        </div>
                        <v-textarea
                          v-model="form.memoryJson"
                          label="Memory JSON"
                          rows="8"
                          auto-grow
                          variant="outlined"
                          :error-messages="inputErrors.memoryJson"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Knowledge Base (JSON)">
                      <v-expansion-panel-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="text-caption text-medium-emphasis">Array de strings.</span>
                          <v-btn size="small" variant="text" @click="setExample('knowledgeBaseJson', examples.knowledgeBase)">
                            Cargar ejemplo
                          </v-btn>
                        </div>
                        <v-textarea
                          v-model="form.knowledgeBaseJson"
                          label="Knowledge Base JSON"
                          rows="8"
                          auto-grow
                          variant="outlined"
                          :error-messages="inputErrors.knowledgeBaseJson"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="User Content (JSON)">
                      <v-expansion-panel-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="text-caption text-medium-emphasis">Contenido mixto texto/imagen.</span>
                          <v-btn size="small" variant="text" @click="setExample('userContentJson', examples.userContent)">
                            Cargar ejemplo
                          </v-btn>
                        </div>
                        <v-textarea
                          v-model="form.userContentJson"
                          label="User Content JSON"
                          rows="8"
                          auto-grow
                          variant="outlined"
                          :error-messages="inputErrors.userContentJson"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="JSON Schema Response Format">
                      <v-expansion-panel-text>
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="text-caption text-medium-emphasis">Formato estructurado opcional.</span>
                          <v-btn size="small" variant="text" @click="setExample('jsonSchemaJson', examples.jsonSchema)">
                            Cargar ejemplo
                          </v-btn>
                        </div>
                        <v-textarea
                          v-model="form.jsonSchemaJson"
                          label="JSON Schema"
                          rows="10"
                          auto-grow
                          variant="outlined"
                          :error-messages="inputErrors.jsonSchemaJson"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="lg" variant="outlined" class="mb-4">
          <v-card-title>Resultado</v-card-title>
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <div v-if="response" class="d-flex flex-wrap ga-2 mb-4">
              <v-chip color="primary" variant="tonal">
                Tokens: {{ response.tokens }}
              </v-chip>
              <v-chip color="secondary" variant="tonal">
                Input: {{ response.inputTokens }}
              </v-chip>
              <v-chip color="secondary" variant="tonal">
                Output: {{ response.outputTokens }}
              </v-chip>
              <v-chip color="success" variant="tonal">
                Tiempo: {{ Math.round(response.time) }} ms
              </v-chip>
            </div>

            <v-textarea
              :model-value="responseOutput"
              label="Output"
              rows="18"
              auto-grow
              readonly
              variant="outlined"
              hide-details
            />
          </v-card-text>
        </v-card>

        <v-card rounded="lg" variant="outlined">
          <v-card-title>Notas</v-card-title>
          <v-card-text class="text-body-2 text-medium-emphasis">
            Esta pantalla envía el request al backend y el backend resuelve el prompt con `OpenAiProviderFactory`.
            Para vision podés subir un `fullFile`: en modo `base64` el backend lee `filepath` y genera un `data:` URL; en modo `url` usa la `url` del archivo y requiere que sea pública y absoluta.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card-title {
  white-space: normal;
}
</style>
