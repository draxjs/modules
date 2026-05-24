# Vuetify 3 Global Styling Skill

## Objetivo

Ayudar a configurar estilos globales y defaults de componentes en proyectos Vue 3 + Vuetify 3, usando principalmente la opción `defaults` de `createVuetify`.

Esta skill debe priorizar:

- Centralizar estilos repetitivos de componentes Vuetify.
- Evitar repetir props como `density`, `variant`, `rounded`, `color`, `elevation`, `class` o `style` en cada uso.
- Mantener una configuración clara, mantenible y escalable.
- Diferenciar correctamente entre defaults globales, defaults por componente y defaults contextuales.
- Usar `class` y `style` solo donde Vuetify lo permite.

---

## Contexto técnico

Vuetify 3 permite definir configuración global mediante `createVuetify`.

Ejemplo base:

```ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
    },
    VBtn: {
      variant: 'flat',
      color: 'primary',
    },
  },
})
```

Los defaults pueden definirse en tres niveles:

1. `global`: aplica props a todos los componentes que soporten esa prop.
2. Componente específico: por ejemplo `VBtn`, `VTextField`, `VCard`.
3. Contextual/anidado: por ejemplo, defaults para `VBtn` solo cuando está dentro de `VCardActions`.

---

## Reglas principales

### 1. Usar nombres de componentes en PascalCase

Cuando se configuren defaults por componente, usar el nombre interno del componente Vuetify en PascalCase.

Correcto:

```ts
export default {
  defaults: {
    VBtn: {
      variant: 'flat',
    },
    VTextField: {
      density: 'compact',
    },
  },
}
```

Incorrecto:

```ts
export default {
  defaults: {
    'v-btn': {
      variant: 'flat',
    },
    'v-text-field': {
      density: 'compact',
    },
  },
}
```

---

### 2. Usar props en camelCase

Las props en `defaults` deben escribirse en camelCase, aunque en templates se usen en kebab-case.

Correcto:

```ts
export default {
  defaults: {
    VTextField: {
      hideDetails: 'auto',
    },
  },
}
```

Incorrecto:

```ts
export default {
  defaults: {
    VTextField: {
      'hide-details': 'auto',
    },
  },
}
```

---

### 3. No usar `class` ni `style` dentro de `global`

Vuetify permite definir `class` y `style` en defaults específicos de componentes, pero no dentro de `global`.

Correcto:

```ts
export default {
  defaults: {
    VBtn: {
      class: 'text-none font-weight-medium',
    },
  },
}
```

Incorrecto:

```ts
export default {
  defaults: {
    global: {
      class: 'text-none',
    },
  },
}
```

---

### 4. Usar `global` solo para props compartidas y seguras

`global` debe usarse para props comunes que varios componentes soportan.

Ejemplos recomendados:

```ts
export default {
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
      ripple: false,
    },
  },
}
```

No asumir que todas las props aplican a todos los componentes. Vuetify solo aplicará el default si el componente soporta esa prop.

---

## Patrones recomendados

### Configuración base de Vuetify

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
    },

    VBtn: {
      variant: 'flat',
      color: 'primary',
      class: 'text-none font-weight-medium',
    },

    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VTextarea: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VCard: {
      elevation: 2,
      rounded: 'xl',
    },
  },
})
```

---

## Estilos personalizados por componente

### Usar `class`

Cuando el estilo pueda expresarse con clases utilitarias de Vuetify o clases CSS propias, preferir `class`.

```ts
export default {
  defaults: {
    VBtn: {
      class: 'text-none font-weight-medium',
    },

    VCard: {
      class: 'app-card',
    },
  },
}
```

Y luego definir la clase en un CSS global:

```css
.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

---

### Usar `style` como string

```ts
export default {
  defaults: {
    VCard: {
      style: 'border: 1px solid rgba(var(--v-theme-on-surface), 0.08);',
    },
  },
}
```

---

### Usar `style` como objeto

```ts
export default {
  defaults: {
    VCard: {
      style: {
        border: '1px solid rgba(var(--v-theme-on-surface), 0.08)',
      },
    },
  },
}
```

---

### Usar `style` como array

```ts
export default {
  defaults: {
    VCard: {
      style: [
        {
          border: '1px solid rgba(var(--v-theme-on-surface), 0.08)',
        },
        {
          overflow: 'hidden',
        },
      ],
    },
  },
}
```

---

## Defaults contextuales

Usar defaults contextuales cuando un componente debe cambiar su estilo solo dentro de otro componente.

Ejemplo: botones dentro de acciones de card.

```ts
export default {
  defaults: {
    VCardActions: {
      VBtn: {
        variant: 'text',
        color: 'primary',
        class: 'text-none',
      },
    },
  },
}
```

Ejemplo: botones dentro de toolbar.

```ts
export default {
  defaults: {
    VToolbar: {
      VBtn: {
        variant: 'text',
        rounded: 'lg',
      },
    },
  },
}
```

---

## Ejemplo recomendado para aplicaciones administrativas

```ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
    },

    VApp: {
      class: 'app-root',
    },

    VBtn: {
      variant: 'flat',
      color: 'primary',
      class: 'text-none font-weight-medium',
    },

    VCard: {
      elevation: 1,
      rounded: 'xl',
      class: 'app-card',
    },

    VCardTitle: {
      class: 'text-h6 font-weight-bold',
    },

    VCardSubtitle: {
      class: 'text-body-2 text-medium-emphasis',
    },

    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VTextarea: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VAutocomplete: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VCombobox: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },

    VCheckbox: {
      density: 'compact',
      hideDetails: 'auto',
    },

    VSwitch: {
      density: 'compact',
      hideDetails: 'auto',
      color: 'primary',
    },

    VDialog: {
      maxWidth: 720,
    },

    VDataTable: {
      density: 'comfortable',
      class: 'app-data-table',
    },

    VCardActions: {
      VBtn: {
        variant: 'text',
        class: 'text-none',
      },
    },

    VToolbar: {
      VBtn: {
        variant: 'text',
        rounded: 'lg',
      },
    },
  },
})
```

CSS sugerido:

```css
.app-root {
  background: rgb(var(--v-theme-background));
}

.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.app-data-table {
  border-radius: 16px;
  overflow: hidden;
}
```

---

## Buenas prácticas

### Preferir defaults para consistencia visual

Usar `defaults` cuando una decisión visual se repite en toda la aplicación.

Buen uso:

```ts
export default {
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'compact',
    },
  },
}
```

Mal uso:

```ts
export default {
  defaults: {
    VTextField: {
      label: 'Nombre',
    },
  },
}
```

Los defaults no deben esconder información específica de negocio o de pantalla.

---

### No abusar de defaults anidados

Los defaults contextuales son útiles, pero si se anidan demasiado pueden volver difícil entender de dónde viene un estilo.

Evitar estructuras demasiado profundas.

Correcto:

```ts
export default {
  defaults: {
    VCardActions: {
      VBtn: {
        variant: 'text',
      },
    },
  },
}
```

Evitar:

```ts
export default {
  defaults: {
    VCard: {
      VCardActions: {
        VBtn: {
          VIcon: {
            size: 18,
          },
        },
      },
    },
  },
}
```

---

### Usar componentes propios cuando el estilo tenga semántica de negocio

Si el estilo representa un concepto del sistema, crear un wrapper component.

Ejemplo:

```vue
<!-- AppPrimaryButton.vue -->
<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <v-btn
    color="primary"
    variant="flat"
    class="text-none font-weight-medium"
    :loading="loading"
  >
    <slot />
  </v-btn>
</template>
```

Usar defaults para estilo general; usar wrappers para componentes con intención semántica.

---

## Cuándo usar cada estrategia

### Usar `defaults.global` cuando:

- La prop aplica a muchos componentes.
- Querés una decisión visual transversal.
- El comportamiento es genérico.

Ejemplo:

```ts
export default {
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
    },
  },
}
```

---

### Usar defaults por componente cuando:

- Querés configurar todos los `VBtn`, `VTextField`, `VCard`, etc.
- Querés agregar `class` o `style`.
- Querés evitar repetir props en cada template.

Ejemplo:

```ts
export default {
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat',
      class: 'text-none',
    },
  },
}
```

---

### Usar defaults contextuales cuando:

- Un componente debe comportarse distinto dentro de otro.
- Por ejemplo, botones dentro de `VCardActions` o `VToolbar`.

Ejemplo:

```ts
export default {
  defaults: {
    VCardActions: {
      VBtn: {
        variant: 'text',
      },
    },
  },
}
```

---

### Usar CSS global cuando:

- Necesitás estilos compartidos por clases.
- Querés usar selectores CSS.
- Querés mantener estilos visuales fuera de la configuración Vuetify.

Ejemplo:

```css
.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

---

### Usar `<style scoped>` cuando:

- El estilo es específico de una vista o componente.
- No debe afectar el resto de la aplicación.

---

## Instrucciones para Codex

Cuando el usuario pida personalizar estilos de Vuetify:

1. Revisar si el estilo debe ser global, por componente, contextual o local.
2. Priorizar `createVuetify({ defaults })` para estilos repetitivos.
3. Usar nombres de componentes en PascalCase.
4. Usar props en camelCase.
5. No poner `class` ni `style` dentro de `defaults.global`.
6. Para estilos personalizados reutilizables, preferir `class` + CSS global.
7. Para estilos simples y puntuales por componente, se puede usar `style`.
8. No modificar cada template individualmente si el cambio es transversal.
9. No crear wrappers innecesarios si alcanza con defaults.
10. Crear wrappers cuando el componente tenga semántica propia del producto.

---

## Checklist de revisión

Antes de finalizar una solución, validar:

- [ ] ¿Se importó `vuetify/styles`?
- [ ] ¿Los componentes están escritos como `VBtn`, `VTextField`, `VCard`, etc.?
- [ ] ¿Las props están en camelCase?
- [ ] ¿No se usó `class` o `style` dentro de `global`?
- [ ] ¿Los estilos repetitivos están centralizados?
- [ ] ¿Los estilos específicos de pantalla quedaron fuera de defaults globales?
- [ ] ¿La solución evita repetir props en todos los templates?
- [ ] ¿El CSS personalizado usa variables de tema cuando corresponde?
- [ ] ¿Los defaults contextuales no están excesivamente anidados?

---

## Ejemplo de refactor esperado

### Antes

```vue
<v-text-field
  v-model="form.name"
  label="Nombre"
  variant="outlined"
  density="compact"
  hide-details="auto"
/>

<v-select
  v-model="form.status"
  :items="statuses"
  label="Estado"
  variant="outlined"
  density="compact"
  hide-details="auto"
/>

<v-btn
  color="primary"
  variant="flat"
  class="text-none font-weight-medium"
>
  Guardar
</v-btn>
```

### Después

Configuración:

```ts
export default {
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VBtn: {
      color: 'primary',
      variant: 'flat',
      class: 'text-none font-weight-medium',
    },
  },
}
```

Template:

```vue
<v-text-field
  v-model="form.name"
  label="Nombre"
/>

<v-select
  v-model="form.status"
  :items="statuses"
  label="Estado"
/>

<v-btn>
  Guardar
</v-btn>
```

---

## Respuesta esperada de Codex

Cuando Codex aplique esta skill, debe explicar brevemente:

- Qué defaults agregó o modificó.
- Por qué eligió `global`, componente específico o contexto.
- Qué props fueron centralizadas.
- Si agregó clases CSS, dónde quedaron definidas.
- Si evitó usar `class` o `style` en `global`.

Ejemplo:

> Centralicé los estilos repetitivos de formularios en `VTextField`, `VSelect` y `VTextarea`, usando `variant: 'outlined'`, `density: 'compact'` y `hideDetails: 'auto'`. Para botones agregué defaults en `VBtn` con `variant`, `color` y `class`. No usé `class` ni `style` en `global` porque Vuetify solo permite esos atributos en defaults específicos por componente.

---

## Referencia

Documentación oficial de Vuetify 3:

- Global Configuration: https://v3.vuetifyjs.com/en/features/global-configuration/
