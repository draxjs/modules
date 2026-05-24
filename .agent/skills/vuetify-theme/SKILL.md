# Vuetify 3 Theme Skill

## Objetivo

Ayudar a configurar, extender y mantener el sistema de temas de Vuetify 3 en proyectos Vue 3, usando `createVuetify({ theme })`.

Esta skill debe priorizar:

- Definir temas `light`, `dark`, `system` o temas personalizados.
- Centralizar colores de marca y variables visuales.
- Usar correctamente `colors`, `variables`, `variations` y `defaultTheme`.
- Aplicar temas por sección usando `theme` en componentes o `v-theme-provider`.
- Configurar `cspNonce` cuando la aplicación tenga reglas CSP estrictas.
- Evitar estilos hardcodeados cuando puedan expresarse con variables del theme.

---

## Contexto técnico

Vuetify 3 permite configurar el theme desde `createVuetify`.

Ejemplo base:

```ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
})
```

Vuetify incluye soporte estándar para temas `light`, `dark` y `system`.

```ts
export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
  },
})
```

Usar `system` cuando se quiera respetar la preferencia del sistema operativo del usuario mediante `prefers-color-scheme`.

---

## Reglas principales

### 1. Definir el theme en `src/plugins/vuetify.ts`

La configuración de temas debe centralizarse en el plugin de Vuetify.

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'appLight',
    themes: {
      appLight: {
        dark: false,
        colors: {
          primary: '#1867C0',
          secondary: '#48A9A6',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
})
```

---

### 2. Usar nombres explícitos para temas personalizados

Preferir nombres semánticos como `appLight`, `appDark`, `highContrast`, `brandLight`.

Correcto:

```ts
 theme: {
   defaultTheme: 'appLight',
   themes: {
     appLight,
     appDark,
   },
 }
```

Evitar nombres ambiguos:

```ts
theme: {
  defaultTheme: 'custom',
  themes: {
    custom,
  },
}
```

---

### 3. Declarar si el theme es claro u oscuro

Todo theme personalizado debe declarar explícitamente `dark: false` o `dark: true`.

```ts
const appLight = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#1867C0',
  },
}

const appDark = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#90CAF9',
  },
}
```

Esto permite que Vuetify gestione correctamente conceptos de Material Design, como superficies elevadas y contraste.

---

### 4. Usar `colors` para colores de marca y estados

Los colores principales deben ir dentro de `colors`.

```ts
colors: {
  primary: '#0D47A1',
  secondary: '#00695C',
  accent: '#7C4DFF',
  error: '#B00020',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FB8C00',
}
```

Vuetify genera clases y variables CSS a partir de esos colores.

Ejemplos de uso:

```vue
<v-btn color="primary">
  Guardar
</v-btn>

<v-alert type="success">
  Operación completada
</v-alert>
```

---

### 5. Usar colores personalizados cuando haya conceptos del producto

Si el sistema tiene conceptos visuales propios, agregarlos al theme.

```ts
colors: {
  primary: '#1867C0',
  secondary: '#48A9A6',
  brand: '#673AB7',
  sidebar: '#111827',
  operator: '#00A884',
  customer: '#1976D2',
  pending: '#FB8C00',
  completed: '#4CAF50',
}
```

Luego usarlos directamente en componentes:

```vue
<v-chip color="pending">
  Pendiente
</v-chip>

<v-avatar color="operator">
  OP
</v-avatar>
```

---

## Variables CSS generadas por Vuetify

Vuetify genera variables CSS para los colores del theme.

Para usarlas en CSS personalizado, usar `rgb(var(--v-theme-colorName))`.

Ejemplo:

```css
.app-panel {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

Para colores personalizados:

```ts
colors: {
  brand: '#673AB7',
}
```

Uso en CSS:

```css
.brand-border {
  border-color: rgb(var(--v-theme-brand));
}

.brand-soft-background {
  background: rgba(var(--v-theme-brand), 0.08);
}
```

Importante: las custom properties de colores son listas RGB. Por eso se deben usar con `rgb()` o `rgba()`.

---

## Variables del theme

Usar `variables` para valores internos del theme o tokens visuales relacionados con opacidades, bordes, código, teclado u otros conceptos compartidos.

```ts
const appLight = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#1867C0',
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.6,
    'disabled-opacity': 0.38,
  },
}
```

No usar `variables` como reemplazo indiscriminado de CSS. Usarlas para tokens globales del sistema visual.

---

## Color variations

Vuetify puede generar variantes `lighten` y `darken` para colores del theme.

```ts
export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'appLight',
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 1,
      darken: 2,
    },
    themes: {
      appLight,
    },
  },
})
```

Esto permite usar variantes como:

```vue
<v-btn color="primary-darken-1">
  Acción principal
</v-btn>

<v-chip color="secondary-lighten-1">
  Etiqueta
</v-chip>
```

Usar `variations` cuando el proyecto realmente necesite variantes derivadas. No generar muchas variantes innecesarias porque aumenta la cantidad de CSS generado.

---

## Aplicar themes por componente o sección

Muchos componentes de Vuetify soportan la prop `theme`.

```vue
<v-card theme="dark">
  <v-card-title>Panel oscuro</v-card-title>
  <v-card-text>
    Los hijos heredan este contexto de theme.
  </v-card-text>
</v-card>
```

Cuando se necesite aplicar un theme a una sección completa, preferir `v-theme-provider`.

```vue
<v-theme-provider theme="highContrast">
  <section>
    <v-card>
      <v-card-title>Modo alto contraste</v-card-title>
    </v-card>
  </section>
</v-theme-provider>
```

Usar esta estrategia para:

- Secciones embebidas con identidad visual diferente.
- Previews de temas.
- Dashboards con modo oscuro parcial.
- Áreas de alto contraste.

---

## Cambio dinámico de theme

Para cambiar el theme desde componentes, usar `useTheme`.

```vue
<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()

function setLightTheme() {
  theme.global.name.value = 'appLight'
}

function setDarkTheme() {
  theme.global.name.value = 'appDark'
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark
    ? 'appLight'
    : 'appDark'
}
</script>

<template>
  <v-btn @click="toggleTheme">
    Cambiar tema
  </v-btn>
</template>
```

Cuando se implemente cambio de theme, considerar persistir la preferencia del usuario en `localStorage`, perfil de usuario o configuración del sistema.

---

## CSP Nonce

### Cuándo usar `cspNonce`

Usar `theme.cspNonce` cuando la aplicación tenga reglas CSP estrictas con `script-src` o `style-src` que requieran nonce para estilos embebidos.

Vuetify genera estilos de theme en runtime e inyecta estilos en el `<head>` del DOM. En entornos con Content Security Policy estricta, esos estilos pueden necesitar un nonce.

Ejemplo de header CSP:

```http
Content-Security-Policy: style-src 'self' 'nonce-dQw4w9WgXcQ'
```

Configuración en Vuetify:

```ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export const vuetify = createVuetify({
  theme: {
    cspNonce: 'dQw4w9WgXcQ',
  },
})
```

---

### Reglas para `cspNonce`

1. El nonce configurado en Vuetify debe coincidir con el nonce permitido por el header CSP.
2. No hardcodear un nonce fijo en producción si el backend genera uno dinámico por request.
3. Si el nonce es dinámico, inyectarlo desde el servidor hacia el frontend de forma segura.
4. No usar `unsafe-inline` como solución rápida si el objetivo es mantener CSP estricta.
5. Documentar de dónde proviene el nonce y cómo llega a `createVuetify`.

---

### Ejemplo con nonce desde variable global

Si el servidor renderiza una variable global segura:

```html
<script nonce="dQw4w9WgXcQ">
  window.__CSP_NONCE__ = 'dQw4w9WgXcQ'
</script>
```

Se puede consumir en Vuetify:

```ts
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

declare global {
  interface Window {
    __CSP_NONCE__?: string
  }
}

export const vuetify = createVuetify({
  theme: {
    cspNonce: window.__CSP_NONCE__,
  },
})
```

Si el proyecto no tiene CSP estricta, no agregar `cspNonce` innecesariamente.

---

## Deshabilitar theme

Vuetify permite deshabilitar la funcionalidad de theme con `theme: false`.

```ts
export const vuetify = createVuetify({
  theme: false,
})
```

Usar esto solo en casos muy específicos, por ejemplo:

- La aplicación tiene un sistema de diseño completamente externo.
- Se quiere evitar que Vuetify genere estilos de theme.
- Se está integrando Vuetify en una app existente con restricciones visuales fuertes.

No usar `theme: false` en aplicaciones Vuetify normales.

---

## Ejemplo recomendado para aplicación administrativa

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

const appLight = {
  dark: false,
  colors: {
    background: '#F6F8FB',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F4F6F8',
    'surface-variant': '#E5E7EB',
    'on-surface-variant': '#374151',

    primary: '#1867C0',
    'primary-darken-1': '#1F5592',
    secondary: '#48A9A6',
    'secondary-darken-1': '#018786',

    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',

    sidebar: '#111827',
    pending: '#FB8C00',
    completed: '#4CAF50',
    cancelled: '#B00020',
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.1,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.6,
    'disabled-opacity': 0.38,
  },
}

const appDark = {
  dark: true,
  colors: {
    background: '#0F172A',
    surface: '#111827',
    'surface-bright': '#1F2937',
    'surface-light': '#1E293B',
    'surface-variant': '#334155',
    'on-surface-variant': '#CBD5E1',

    primary: '#90CAF9',
    'primary-darken-1': '#42A5F5',
    secondary: '#80CBC4',
    'secondary-darken-1': '#26A69A',

    error: '#EF5350',
    info: '#64B5F6',
    success: '#81C784',
    warning: '#FFB74D',

    sidebar: '#020617',
    pending: '#FFB74D',
    completed: '#81C784',
    cancelled: '#EF5350',
  },
  variables: {
    'border-color': '#FFFFFF',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.9,
    'medium-emphasis-opacity': 0.65,
    'disabled-opacity': 0.4,
  },
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'appLight',
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 1,
      darken: 2,
    },
    themes: {
      appLight,
      appDark,
    },
  },
})
```

---

## CSS recomendado usando variables del theme

```css
.app-shell {
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
}

.app-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.app-sidebar {
  background: rgb(var(--v-theme-sidebar));
  color: white;
}

.status-pending {
  color: rgb(var(--v-theme-pending));
}

.status-completed {
  color: rgb(var(--v-theme-completed));
}
```

---

## Buenas prácticas

### Preferir tokens del theme sobre colores hardcodeados

Correcto:

```css
border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
```

Evitar:

```css
border: 1px solid #e0e0e0;
```

---

### Usar nombres semánticos

Correcto:

```ts
colors: {
  pending: '#FB8C00',
  completed: '#4CAF50',
  cancelled: '#B00020',
}
```

Menos mantenible:

```ts
colors: {
  orangeCustom: '#FB8C00',
  greenCustom: '#4CAF50',
  redCustom: '#B00020',
}
```

---

### No mezclar theme con defaults de componentes

El theme define colores y tokens visuales.

Los defaults definen props repetitivas de componentes.

Correcto:

```ts
createVuetify({
  theme: {
    defaultTheme: 'appLight',
    themes: { appLight },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat',
    },
  },
})
```

Evitar poner decisiones de layout o comportamiento dentro del theme.

---

### No abusar de colores personalizados

Agregar colores personalizados solo cuando representen conceptos reales del producto o del sistema visual.

Evitar convertir el theme en una lista enorme de colores sin criterio.

---

### Evitar `theme: false` salvo necesidad concreta

En una aplicación Vuetify normal, mantener el sistema de theme activo.

---

## Instrucciones para Codex

Cuando el usuario pida configurar o ajustar temas de Vuetify:

1. Buscar la configuración de Vuetify, normalmente en `src/plugins/vuetify.ts` o `src/plugins/vuetify.js`.
2. Verificar que exista `import 'vuetify/styles'`.
3. Identificar si el cambio corresponde a:
   - theme global,
   - theme personalizado,
   - colores de marca,
   - variables visuales,
   - variantes lighten/darken,
   - cambio dinámico de theme,
   - CSP nonce.
4. Centralizar colores en `theme.themes.<themeName>.colors`.
5. Centralizar tokens visuales en `theme.themes.<themeName>.variables`.
6. Usar variables CSS `rgb(var(--v-theme-*)))` o `rgba(var(--v-theme-*), opacity)` en estilos personalizados.
7. Si se configura `cspNonce`, explicar que debe coincidir con el nonce del header CSP.
8. No agregar `unsafe-inline` como recomendación por defecto.
9. No hardcodear colores en múltiples componentes si pueden venir del theme.
10. Mantener separados `theme` y `defaults`.

---

## Checklist de revisión

Antes de finalizar una solución, validar:

- [ ] ¿El theme está definido en `createVuetify`?
- [ ] ¿Existe `defaultTheme` cuando corresponde?
- [ ] ¿Los temas personalizados declaran `dark: true` o `dark: false`?
- [ ] ¿Los colores de marca están en `colors`?
- [ ] ¿Los tokens visuales están en `variables`?
- [ ] ¿El CSS personalizado usa `rgb(var(--v-theme-*)))` o `rgba(var(--v-theme-*), opacity)`?
- [ ] ¿No se repiten colores hardcodeados en componentes?
- [ ] ¿Las variantes `lighten` y `darken` se generan solo si hacen falta?
- [ ] ¿El uso de `v-theme-provider` está justificado para secciones completas?
- [ ] ¿El `cspNonce`, si existe, coincide con la estrategia CSP del backend?
- [ ] ¿No se usó `theme: false` sin una razón clara?

---

## Ejemplo de refactor esperado

### Antes

```vue
<template>
  <v-card style="background: #ffffff; border: 1px solid #e0e0e0;">
    <v-card-title style="color: #1867C0;">
      Configuración
    </v-card-title>

    <v-chip style="background: #FB8C00; color: white;">
      Pendiente
    </v-chip>
  </v-card>
</template>
```

### Después

Theme:

```ts
const appLight = {
  dark: false,
  colors: {
    background: '#F6F8FB',
    surface: '#FFFFFF',
    primary: '#1867C0',
    pending: '#FB8C00',
  },
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'appLight',
    themes: {
      appLight,
    },
  },
})
```

CSS:

```css
.app-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

Template:

```vue
<template>
  <v-card class="app-card">
    <v-card-title class="text-primary">
      Configuración
    </v-card-title>

    <v-chip color="pending">
      Pendiente
    </v-chip>
  </v-card>
</template>
```

---

## Respuesta esperada de Codex

Cuando Codex aplique esta skill, debe explicar brevemente:

- Qué theme agregó o modificó.
- Qué colores fueron centralizados.
- Qué variables del theme se agregaron.
- Si agregó `variations`, por qué.
- Si usó `v-theme-provider` o prop `theme`, en qué contexto.
- Si configuró `cspNonce`, cómo debe relacionarse con el header CSP.

Ejemplo:

"Centralicé los colores de marca y estados dentro de `theme.themes.appLight.colors`, agregando `primary`, `surface`, `pending` y `completed`. Reemplacé estilos hardcodeados por variables `rgb(var(--v-theme-*)))` para que los estilos respondan correctamente al theme activo. No agregué `cspNonce` porque el proyecto no evidencia una política CSP estricta que lo requiera."
