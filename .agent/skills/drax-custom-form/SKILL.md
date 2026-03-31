---
description: Guía para crear formularios a medida reutilizando la estructura, componentes y utilidades de Drax (Vuejs 3, Vuetify 3 y API REST).
---

# Desarrollo de Formularios a Medida en Drax

Esta skill proporciona pautas sobre cómo crear formularios personalizados adaptados a casos de uso específicos, mientras se reutiliza lo más posible la estructura, los componentes y las utilidades de Drax.

Se inspira en componentes como `InscripcionesForm.vue`, que definen secciones muy específicas (por ejemplo: Alumno, Madre, Padre) y manejan estados personalizados, sacando provecho de los composables de `@drax/crud-vue`, los `Providers` y las clases `Crud`.

## 1. Principios Básicos

- **Usa las instancias `Crud`**: Utiliza la clase `Crud` de la entidad (ej: `InscripcionCrud.instance`) para obtener definiciones de campos y pasarlas a los componentes de Drax.
- **Usa las instancias `Provider`**: Comunícate con el backend usando el `Provider` de la entidad (que extiende de `AbstractCrudRestProvider`) para realizar operaciones comunes como `findById`, `create` y `update`.
- **Usa el Composable `useCrud`**: Úsalo desde `@drax/crud-vue` para aprovechar funciones utilitarias rápidas como `cast` y `cloneItem`.
- **Usa `<crud-form-field>`**: Renderiza de manera eficiente todos los inputs del formulario apoyándote en este componente de Drax y basándote en la configuración `IEntityCrudField`.
- **Maneja Errores de Backend**: Captura las excepciones de validación que provienen del backend y mapea `e.inputErrors` hacia el estado del componente para que los inputs los reflejen.

## 2. Estructura del Componente (Script Setup)

### Estado y Reactividad
Define el estado del formulario, los indicadores de carga y el manejo de errores. Es importante el uso de una variable reactiva tipo `Record<string, string[]>` para que el componente atrape fallos de validación provenientes de la API REST de manera transparente:

```typescript
import { onMounted, ref, toRaw, computed } from 'vue'
import { useCrud, CrudFormField } from '@drax/crud-vue'
import { useI18n } from 'vue-i18n'
import type { IEntityCrudField } from '@drax/crud-share'

// 1. Importar la Entidad y su Configuración
import PersonaProvider from '@/modules/modulo/providers/PersonaProvider'
import PersonaCrud from '../cruds/PersonaCrud'
import type { IPersona, IPersonaBase } from '../interfaces/IPersona'

// Opcional: Recibir un ID por props (ejemplo, para edición)
const props = defineProps<{ id?: string }>()
const { t } = useI18n()
const formRef = ref() // ref al v-form

const loading = ref(false)
const ready = ref(false)
const error = ref<string | null>(null)
const entity = ref<IPersona | null>(null)

// 2. Errores del Backend estructurados por campo
const inputErrors = ref<Record<string, string[]>>({})

// 3. Objeto principal asociado al formulario
const form = ref<Partial<IPersonaBase> & Record<string, unknown>>({})

// 4. Utilidades base de Drax
const { cast, cloneItem } = useCrud(PersonaCrud.instance)
```

### Configuración Personalizada de Campos
Para disponer los campos de una manera visualmente custom (ej: tarjetas divididas, pestañas o acordeones), puedes definir localmente arrays de tipo `IEntityCrudField`. Esto es ideal en vez de reestructurar globalmente las pestañas nativas del `Crud`:

```typescript
// Sub-grupo de datos personales
const datosPersonales: IEntityCrudField[] = [
  { name: 'nombres', type: 'string', label: 'nombres', default: '', md: 6 },
  { name: 'apellidos', type: 'string', label: 'apellidos', default: '', md: 6 },
  { name: 'fechaNacimiento', type: 'date', label: 'fechaNacimiento', default: null, md: 6 },
  { name: 'genero', type: 'enum', label: 'genero', default: null, enum: ['m', 'f', 'x'], md: 6 },
]
```

Cuando definas `IEntityCrudField[]` en un formulario a medida, usa exactamente los mismos tipos y reglas de consistencia que usa Drax en los CRUDs estándar. `<crud-form-field>` interpreta la configuración del field y decide qué componente renderizar.

Tipos disponibles en `IEntityCrudField.type`:

- Escalares: `id`, `string`, `longString`, `number`, `boolean`, `date`, `password`, `file`, `fullFile`.
- Estructurados: `object`, `record`.
- Relaciones y opciones: `ref`, `enum`, `select`.
- Arrays: `array.string`, `array.number`, `array.object`, `array.record`, `array.ref`, `array.enum`, `array.fullFile`.

Reglas importantes por tipo:

- `string`, `longString`, `password`, `id`: normalmente usa `default: ''`.
- `number`: usa un número (`0`, `1`, etc.) o `null` si el valor inicia vacío.
- `boolean`: usa `default: false` o `true`.
- `date`: normalmente usa `default: null`. Puedes complementar con `endOfDay`, `showEndOfDayChip` y `max`.
- `file`, `fullFile`: normalmente usa `default: null`. Puedes complementar con `preview` y `previewHeight`.
- `enum`: requiere `enum: string[]`.
- `select`: requiere `items`.
- `ref`: requiere `ref` y `refDisplay`. Además, la entidad pasada en `:entity` debe resolver ese `ref` dentro de `refs`.
- `object`: requiere `objectFields` y como mínimo `default: {}`.
- `record`: como mínimo `default: {}`.
- `array.string`, `array.number`, `array.record`, `array.fullFile`: como mínimo `default: []`.
- `array.enum`: requiere `enum: string[]` y como mínimo `default: []`.
- `array.ref`: requiere `ref` y `refDisplay`, y como mínimo `default: []`.
- `array.object`: requiere `objectFields` y como mínimo `default: []`.

Reglas de consistencia para `default`:

- Si el tipo empieza con `array.`, el `default` debe ser un array. Valor mínimo seguro: `[]`.
- Si el tipo es `object` o `record`, el `default` debe ser un objeto. Valor mínimo seguro: `{}`.
- Si el tipo es escalar, el `default` debería respetar el shape esperado del input.
- Evita mezclar shapes incompatibles, por ejemplo `type: 'array.string'` con `default: null` o `type: 'object'` con `default: []`.

Propiedades extra útiles de `IEntityCrudField`:

- Elección o relación: `ref`, `refDisplay`, `enum`, `items`, `addOnTheFly`.
- Objetos y arrays complejos: `objectFields`, `arrayObjectUI`, `arrayObjectShowField`, `menuMaxHeight`.
- UX del input: `label`, `hint`, `persistentHint`, `placeholder`, `persistentPlaceholder`, `hideDetails`, `readonly`.
- Íconos y archivos: `prependIcon`, `prependInnerIcon`, `appendIcon`, `appendInnerIcon`, `preview`, `previewHeight`.
- Layout: `rows`, `cols`, `sm`, `md`, `lg`, `xl`.
- Comportamiento adicional: `permission`, `noFilter`, `endOfDay`, `showEndOfDayChip`, `max`, `groupTab`, `groupMenu`.

Ejemplo ampliado de fields para formularios a medida:

```typescript
const datosPersonales: IEntityCrudField[] = [
  { name: 'nombres', type: 'string', label: 'nombres', default: '', md: 6 },
  { name: 'apellidos', type: 'string', label: 'apellidos', default: '', md: 6 },
  { name: 'fechaNacimiento', type: 'date', label: 'fechaNacimiento', default: null, md: 6 },
  { name: 'genero', type: 'enum', label: 'genero', default: null, enum: ['m', 'f', 'x'], md: 6 },
  { name: 'activo', type: 'boolean', label: 'activo', default: false, md: 4 },
  { name: 'password', type: 'password', label: 'password', default: '', md: 4 },
  { name: 'observaciones', type: 'longString', label: 'observaciones', default: '', rows: 4, cols: 12 },
]

const datosRelacionados: IEntityCrudField[] = [
  {
    name: 'tenant',
    type: 'ref',
    label: 'tenant',
    default: null,
    ref: 'Tenant',
    refDisplay: 'name',
    md: 6
  },
  {
    name: 'nivel',
    type: 'select',
    label: 'nivel',
    default: null,
    items: [
      { title: 'Basico', value: 'basic' },
      { title: 'Intermedio', value: 'intermediate' },
      { title: 'Avanzado', value: 'advanced' }
    ],
    md: 6
  }
]

const datosAnidados: IEntityCrudField[] = [
  {
    name: 'direccion',
    type: 'object',
    label: 'direccion',
    default: {},
    objectFields: [
      { name: 'calle', type: 'string', label: 'calle', default: '', md: 8 },
      { name: 'numero', type: 'string', label: 'numero', default: '', md: 4 }
    ]
  },
  {
    name: 'telefonos',
    type: 'array.string',
    label: 'telefonos',
    default: []
  },
  {
    name: 'familiares',
    type: 'array.object',
    label: 'familiares',
    default: [],
    arrayObjectUI: 'accordion',
    arrayObjectShowField: 'nombres',
    objectFields: [
      { name: 'nombres', type: 'string', label: 'nombres', default: '' },
      { name: 'parentesco', type: 'enum', label: 'parentesco', default: null, enum: ['madre', 'padre', 'tutor'] }
    ]
  }
]
```

Recomendaciones prácticas:

- Si el formulario a medida reutiliza refs del CRUD, sigue usando la misma `Crud.instance` como `entity` para que `<crud-form-field>` pueda resolver `ref` y `refDisplay`.
- Si defines fields localmente, mantén nombres, tipos y defaults compatibles con la interfaz y con el payload esperado por el backend.
- Si el formulario mezcla bloques visuales distintos, puedes separar los arrays de fields por sección, pero manteniendo una sola fuente reactiva `form`.

### Carga de Datos desde el Backend
En caso de que estemos editando un registro, busca la información a través del `Provider` de la entidad y clona la información de forma segura en el objeto `form` reactivo usando las funciones utilitarias de Drax.

```typescript
async function load() {
  if (!props.id) {
    ready.value = true
    return
  }
  
  loading.value = true
  try {
    entity.value = await PersonaProvider.instance.findById(props.id)
    form.value = cast(cloneItem(entity.value))
    ready.value = true
  } catch (e: any) {
    error.value = e?.message ?? 'Ha ocurrido un error al cargar los datos'
  } finally {
    loading.value = false
  }
}

onMounted(load)
```

### Envío y Manejo de Errores de la API
Valida primero con el componente `<v-form>` de Vuetify. Si es correcto, utiliza el `Provider` para hacer un `POST` (create) o `PUT` (update). Captura validaciones de backend si falla.

```typescript
async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    if (props.id) {
      entity.value = await PersonaProvider.instance.update(props.id, toRaw(form.value) as IPersonaBase)
    } else {
      entity.value = await PersonaProvider.instance.create(toRaw(form.value) as IPersonaBase)
    }
    // Acción post-guardado (exito, notificaciones, ruteo)
  } catch (e: any) {
    // 💡 Aquí atrapamos el array de errores lanzado por el backend (NestJS/Class-Validator)
    if (e.inputErrors) {
      inputErrors.value = e.inputErrors
    }
  } finally {
    loading.value = false
  }
}

// Función computada para inyectar errores específicos al template de cada campo
const errorMessages = computed(() => {
  return (fieldName: string): string[] => {
    return inputErrors.value?.[fieldName] ?? []
  }
})
```

## 3. Estructura del Template (Vuetify 3)

Se construye la interfaz de usuario con `<v-form>` y el clásico sistema de grillas de Vuetify (`<v-row>` / `<v-col>`). El secreto está en iterar las definiciones `IEntityCrudField` que armamos antes, y cederle la renderización del input a `<crud-form-field>`.

```vue
<template>
  <v-card v-if="ready" rounded="lg" variant="elevated">
    <v-card-title class="text-h3 text-wrap">Formulario a Medida</v-card-title>
    
    <v-card-text>
      <!-- Se enlaza el ref formRef para ser llamado en el método valid() -->
      <v-form ref="formRef" @submit.prevent>
        <v-row>
          <!-- Grupo de Datos Personales (Bloque visual customizado) -->
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title>Datos Personales</v-card-title>
              <v-card-text>
                <v-row>
                  <!-- 💪 Reutilizamos la lógica del arreglo que hemos definido en Setup -->
                  <v-col
                    v-for="field in datosPersonales"
                    :key="field.name"
                    :cols="field.cols ? field.cols : 12"
                    :md="field.md ? field.md : undefined"
                  >
                    <!-- Permite una sobre-personalización por "slot" si un caso especifico así lo requiere -->
                    <slot :name="`field.${field.name}`" v-bind="{field}">
                      <!-- 🚀 Magia de Drax: Este componente dinámico decidirá si usar
                           v-text-field, v-select, v-file-input, datepicker, etc...  -->
                      <crud-form-field
                        :field="field"
                        :entity="PersonaCrud.instance"
                        v-model="form[field.name]"
                        :error-messages="errorMessages(field.name)"
                        :rules="[(v: any) => !!v || 'Campo Requerido']"
                      />
                    </slot>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- Acciones -->
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" @click="submit" color="blue" :loading="loading">
        {{ t('action.save') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
```

## 4. Opciones Avanzadas: Sólo Lectura y Deshabilitado (ReadOnly)
En ocasiones, la entidad que manipulamos entra por lógica de dominio en un estado cerrado o solo de lectura (ejemplo `completo: true` de `InscripcionCrud`).
Puedes habilitarlo añadiendo una computed check en tu script:

```typescript
const isReadOnly = computed(() => {
  return !!entity?.value?.completo;
})
```
Y luego inyectarlo al componente `<crud-form-field>`:
```vue
<crud-form-field
  :readonly="isReadOnly"
  ...
/>
```
O aplicar lo mismo para ocultar los botones de guardar de manera condicional.

## 5. Resumen de Utilidades Drax Involucradas

- **Proveedor Base (`AbstractCrudRestProvider`)**: Provee métodos de backend ya tipados universalmente, como `create(data)`, `update(id, data)`, `findById(id)`, eliminando la necesidad de escribir repetidamente peticiones crudas a `axios`.
- **Instancia Centralizada (`Crud Instance`)**: Toda entidad posee su clase singleton `EntityCrud.instance`. Sirve como el "single source of truth" (fuente única de la verdad) sobre las configuraciones visuales del campo o referenciales foráneos entre colecciones. Al conectarlo mediante el prop `:entity`, Drax comprende si el campo exige un Ref a otra colección y cómo interactuar con ella.
- **Renderizador de Inputs (`<crud-form-field>`)**: Analiza la configuración pasiva y monta al vuelo bajo el estándar de Vuetify 3 el tipo de input adecuado, ahorrando horas e inconsistencias en la capa visual.
