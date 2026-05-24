# Vuetify 3 Icon Fonts Skill

## Objetivo

Ayudar a configurar y usar iconos en proyectos Vue 3 + Vuetify 3 usando la feature **Icon Fonts** de Vuetify.

Esta skill debe priorizar:

- Configurar correctamente `icons` dentro de `createVuetify`.
- Importar el set de iconos adecuado.
- Diferenciar entre icon fonts, SVG icon sets, aliases y múltiples sets.
- Usar `v-icon` con la prop `icon`, que es la forma recomendada en Vuetify 3.
- Evitar errores comunes como registrar un set pero no instalar/importar la librería de iconos.
- Mantener una configuración clara, escalable y fácil de migrar.

---

## Contexto técnico

Vuetify 3 soporta múltiples librerías de iconos, entre ellas:

- Material Design Icons.
- Material Icons.
- Font Awesome.
- Phosphor.
- Lucide.
- Tabler.
- Remix Icon.
- BoxIcons.
- Carbon.
- Material Symbols.
- Sets integrados con UnoCSS / Iconify.
- Sets personalizados.

La configuración se realiza dentro de `createVuetify`, usando la propiedad `icons`.

Ejemplo base con Material Design Icons:

```ts
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
```

Uso recomendado:

```vue
<template>
  <v-icon icon="mdi-home" />
</template>
```

Aunque Vuetify 3 todavía permite usar el contenido del slot:

```vue
<v-icon>mdi-home</v-icon>
```

se debe preferir la prop `icon`.

---

## Reglas principales

### 1. Siempre instalar o importar la librería de iconos

Registrar un icon set en Vuetify no alcanza si la fuente o paquete correspondiente no está disponible en el proyecto.

Correcto:

```ts
import '@mdi/font/css/materialdesignicons.css'
```

Incorrecto:

```ts
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
```

Si falta el CSS o la librería, los iconos pueden no renderizarse correctamente.

---

### 2. Usar `icon` prop en Vuetify 3

Correcto:

```vue
<v-icon icon="mdi-home" />
```

Aceptable, pero no recomendado para código nuevo:

```vue
<v-icon>mdi-home</v-icon>
```

En componentes Vuetify que aceptan iconos, usar también strings compatibles:

```vue
<v-btn prepend-icon="mdi-plus">
  Nuevo
</v-btn>

<v-alert icon="mdi-information">
  Información importante
</v-alert>
```

---

### 3. Usar aliases con prefijo `$`

Los aliases permiten definir nombres semánticos reutilizables.

Uso:

```vue
<v-icon icon="$close" />
```

Los aliases son especialmente útiles para:

- Iconos internos usados por componentes Vuetify.
- Iconos semánticos propios del producto.
- Evitar repetir nombres concretos de librerías en toda la aplicación.

---

### 4. No confundir Material Icons con Material Design Icons

En la documentación de Vuetify:

- **Material Icons** refiere a los iconos oficiales de Google.
- **Material Design Icons** refiere a la librería extendida de terceros, usualmente `@mdi/font`.

Ejemplo MDI:

```vue
<v-icon icon="mdi-home" />
```

Ejemplo Material Icons:

```vue
<v-icon icon="home" />
```

---

### 5. Usar el nombre correcto del icon set

Cada set debe registrarse con el mismo nombre usado en `defaultSet` y en `sets`.

Correcto:

```ts
icons: {
  defaultSet: 'mdi',
  aliases,
  sets: {
    mdi,
  },
}
```

Incorrecto:

```ts
icons: {
  defaultSet: 'material',
  aliases,
  sets: {
    mdi,
  },
}
```

---

## Configuración recomendada con MDI CSS

Material Design Icons es el set por defecto más común para Vuetify.

### Instalación

```bash
npm install @mdi/font -D
```

o:

```bash
pnpm add @mdi/font -D
```

### Configuración

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
```

### Uso

```vue
<template>
  <v-icon icon="mdi-home" />

  <v-btn prepend-icon="mdi-plus">
    Crear
  </v-btn>

  <v-text-field
    label="Buscar"
    prepend-inner-icon="mdi-magnify"
  />
</template>
```

---

## Configuración con Material Icons

### Instalación por CDN

En `index.html`:

```html
<link
  href="https://fonts.googleapis.com/css?family=Material+Icons"
  rel="stylesheet"
/>
```

### Configuración

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, md } from 'vuetify/iconsets/md'

import 'vuetify/styles'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
    },
  },
})
```

### Uso

```vue
<template>
  <v-icon icon="home" />
  <v-icon icon="menu" />
  <v-icon icon="close" />
</template>
```

---

## Configuración con Font Awesome CSS

### Instalación

```bash
npm install @fortawesome/fontawesome-free -D
```

o:

```bash
pnpm add @fortawesome/fontawesome-free -D
```

### Configuración

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'

import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.css'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
    },
  },
})
```

### Uso

```vue
<template>
  <v-icon icon="fas fa-home" />
  <v-icon icon="fas fa-plus" />
  <v-icon icon="far fa-user" />
</template>
```

---

## Font Awesome SVG

Usar Font Awesome SVG cuando se necesite trabajar con los paquetes SVG oficiales de Font Awesome y registrar el componente global `font-awesome-icon`.

### Instalación

```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/vue-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons -D
```

### Configuración

```ts
// src/main.ts

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

import App from './App.vue'
import 'vuetify/styles'

library.add(fas)
library.add(far)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

const vuetify = createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
    },
  },
})

app.use(vuetify)
app.mount('#app')
```

### Uso

```vue
<template>
  <v-icon icon="fas fa-home" />
  <v-icon icon="far fa-user" />
</template>
```

### Advertencia

No usar el archivo JavaScript `all.js` de Font Awesome como reemplazo directo del CSS en Vue. Para Font Awesome SVG, usar los paquetes oficiales y registrar `FontAwesomeIcon`.

---

## Múltiples icon sets

Vuetify permite registrar varios sets al mismo tiempo.

Ejemplo: usar Font Awesome como set principal y mantener MDI como set adicional.

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.css'
import '@mdi/font/css/materialdesignicons.css'

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
      mdi,
    },
  },
})
```

Uso:

```vue
<template>
  <!-- Usa el set default: Font Awesome -->
  <v-icon icon="fas fa-plus" />

  <!-- Usa MDI explícitamente con prefijo de set -->
  <v-icon icon="mdi:mdi-minus" />
</template>
```

Cuando un icono pertenece al set default, no hace falta usar prefijo.

Cuando un icono pertenece a un set no default, usar:

```txt
setName:iconName
```

Ejemplo:

```vue
<v-icon icon="mdi:mdi-home" />
```

---

## Icon aliases personalizados

Los aliases personalizados permiten desacoplar el código del nombre real del icono.

### Ejemplo recomendado

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const customAliases = {
  ...aliases,

  product: 'mdi-package-variant-closed',
  support: 'mdi-lifebuoy',
  dashboard: 'mdi-view-dashboard',
  users: 'mdi-account-group',
  settings: 'mdi-cog',
}

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: customAliases,
    sets: {
      mdi,
    },
  },
})
```

Uso:

```vue
<template>
  <v-icon icon="$product" />
  <v-icon icon="$support" />

  <v-list-item
    title="Usuarios"
    prepend-icon="$users"
  />
</template>
```

---

## Cuándo usar aliases

Usar aliases cuando:

- El icono representa un concepto de negocio.
- El mismo icono se usa muchas veces.
- Se quiere poder cambiar la librería o el icono real sin tocar todos los templates.
- Se quiere mantener consistencia visual.
- Se quiere evitar mezclar nombres técnicos de iconos con conceptos del producto.

Ejemplo:

```vue
<v-icon icon="$users" />
```

es preferible a:

```vue
<v-icon icon="mdi-account-group" />
```

si `users` es una entidad importante del sistema.

---

## Uso con componentes Vuetify

Muchos componentes aceptan props de iconos.

Ejemplos:

```vue
<v-btn prepend-icon="mdi-plus">
  Crear
</v-btn>

<v-btn append-icon="mdi-arrow-right">
  Continuar
</v-btn>

<v-text-field
  label="Buscar"
  prepend-inner-icon="mdi-magnify"
  clearable
/>

<v-alert
  type="info"
  icon="mdi-information"
>
  Mensaje informativo
</v-alert>

<v-list-item
  title="Configuración"
  prepend-icon="mdi-cog"
/>
```

Con aliases:

```vue
<v-btn prepend-icon="$add">
  Crear
</v-btn>

<v-list-item
  title="Configuración"
  prepend-icon="$settings"
/>
```

---

## Uso con UnoCSS / Iconify

Vuetify puede integrarse con UnoCSS Preset Icons, permitiendo usar múltiples sets disponibles en Iconify.

Este enfoque es útil cuando:

- Se quiere tree-shaking de iconos.
- Se quiere usar varios sets modernos.
- Se busca reducir el CSS final incluyendo solo los iconos usados.
- Se trabaja con librerías como Lucide, Tabler, Phosphor, Remix Icon, Carbon, etc.

Ejemplo de uso en template:

```vue
<template>
  <v-alert
    icon="i-solar:album-linear"
    title="Create new album"
  />

  <v-alert
    icon="i-devicon:gitlab"
    title="Login with GitLab"
  />
</template>
```

Cuando se use UnoCSS, Codex debe revisar la configuración concreta del proyecto antes de modificar imports, porque requiere dependencias y configuración adicional fuera de `createVuetify`.

---

## Crear un custom icon set

Un icon set personalizado es un objeto con una propiedad `component`.

Ese componente funcional recibe props de icono y renderiza el icono.

Usar custom icon sets solo cuando:

- La aplicación tiene una librería propia de iconos.
- Se necesita renderizar SVGs internos.
- Se quiere integrar una librería no soportada directamente.
- Se quiere un control total sobre el render.

No usar custom icon sets si alcanza con MDI, Material Icons, Font Awesome o Iconify.

---

## Patrón recomendado para proyectos administrativos

Para sistemas administrativos, ABMs, dashboards y backoffices, se recomienda:

- Usar MDI como set principal.
- Definir aliases semánticos para entidades y acciones frecuentes.
- Usar `icon` prop en todos los usos nuevos.
- Evitar hardcodear demasiados nombres de iconos en vistas de negocio.

Ejemplo:

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const appIconAliases = {
  ...aliases,

  add: 'mdi-plus',
  edit: 'mdi-pencil',
  delete: 'mdi-delete',
  save: 'mdi-content-save',
  cancel: 'mdi-close',
  search: 'mdi-magnify',
  filter: 'mdi-filter',
  refresh: 'mdi-refresh',
  settings: 'mdi-cog',
  users: 'mdi-account-group',
  roles: 'mdi-shield-account',
  dashboard: 'mdi-view-dashboard',
  reports: 'mdi-chart-box',
  notifications: 'mdi-bell',
  audit: 'mdi-history',
}

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: appIconAliases,
    sets: {
      mdi,
    },
  },
})
```

Uso:

```vue
<template>
  <v-btn prepend-icon="$add">
    Nuevo
  </v-btn>

  <v-btn prepend-icon="$save">
    Guardar
  </v-btn>

  <v-text-field
    label="Buscar"
    prepend-inner-icon="$search"
  />

  <v-list-item
    title="Auditoría"
    prepend-icon="$audit"
  />
</template>
```

---

## Errores comunes

### Error 1: Los iconos muestran texto en lugar del icono

Causa probable:

- No se importó el CSS de la librería.
- El icono no existe.
- Se está usando el nombre incorrecto para el set activo.

Solución:

```ts
import '@mdi/font/css/materialdesignicons.css'
```

y verificar:

```vue
<v-icon icon="mdi-home" />
```

---

### Error 2: Usar iconos MDI sin prefijo `mdi-`

Incorrecto:

```vue
<v-icon icon="home" />
```

Correcto para MDI:

```vue
<v-icon icon="mdi-home" />
```

Correcto para Material Icons:

```vue
<v-icon icon="home" />
```

---

### Error 3: Configurar MDI SVG pero esperar comportamiento de MDI CSS

MDI CSS permite usar strings como:

```vue
<v-icon icon="mdi-home" />
```

MDI SVG requiere otra estrategia y puede requerir importar iconos específicos.

Si se quiere simplicidad y uso por string, preferir:

```ts
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
```

---

### Error 4: No incluir aliases base

Incorrecto:

```ts
icons: {
  defaultSet: 'mdi',
  sets: {
    mdi,
  },
}
```

Correcto:

```ts
icons: {
  defaultSet: 'mdi',
  aliases,
  sets: {
    mdi,
  },
}
```

Los aliases base son usados por componentes Vuetify para iconos comunes como cerrar, expandir, limpiar, navegación, checkboxes, etc.

---

### Error 5: Duplicar nombres técnicos en toda la app

Evitar:

```vue
<v-icon icon="mdi-account-group" />
<v-icon icon="mdi-account-group" />
<v-icon icon="mdi-account-group" />
```

Preferir:

```ts
const appIconAliases = {
  ...aliases,
  users: 'mdi-account-group',
}
```

```vue
<v-icon icon="$users" />
```

---

## Criterios de decisión

### Usar MDI CSS cuando:

- Se busca facilidad de uso.
- No preocupa demasiado el tamaño de la fuente completa.
- Se quiere compatibilidad simple con `mdi-*`.
- El proyecto es un backoffice, dashboard o sistema interno.

### Usar Font Awesome CSS cuando:

- El diseño del producto ya usa Font Awesome.
- El equipo conoce la nomenclatura `fas`, `far`, `fab`.
- Se quiere integración simple por CSS.

### Usar Font Awesome SVG cuando:

- Se necesita control por paquetes SVG.
- Se usan iconos Pro.
- Se quiere agregar iconos específicos a una librería.
- Se acepta una configuración más compleja.

### Usar UnoCSS / Iconify cuando:

- Se quiere tree-shaking.
- Se usan muchas librerías de iconos diferentes.
- Se busca optimizar el bundle.
- El proyecto ya usa UnoCSS.

### Usar custom icon set cuando:

- Hay una librería propia de iconos.
- Se renderizan SVGs internos.
- Ningún set soportado resuelve el caso.

---

## Instrucciones para Codex

Cuando el usuario pida configurar iconos en Vuetify 3:

1. Identificar qué librería quiere usar: MDI, Material Icons, Font Awesome, UnoCSS/Iconify o custom.
2. Revisar si la dependencia está instalada.
3. Revisar si el CSS o componente necesario está importado.
4. Configurar `icons` dentro de `createVuetify`.
5. Incluir siempre `aliases` del set cuando corresponda.
6. Registrar el set dentro de `sets`.
7. Definir `defaultSet` correctamente.
8. Usar la prop `icon` en `v-icon`.
9. Usar aliases personalizados para conceptos de negocio o acciones repetidas.
10. Si hay múltiples sets, usar prefijos para los sets no default.
11. Evitar migraciones innecesarias a SVG si el proyecto solo necesita icon fonts simples.
12. No inventar nombres de iconos: usar nombres reales de la librería seleccionada.

---

## Checklist de revisión

Antes de finalizar una solución, validar:

- [ ] ¿La dependencia de iconos está instalada?
- [ ] ¿El CSS de la librería está importado cuando corresponde?
- [ ] ¿`vuetify/styles` está importado?
- [ ] ¿`createVuetify` tiene configurado `icons`?
- [ ] ¿`defaultSet` coincide con una clave de `sets`?
- [ ] ¿Se importaron y registraron `aliases`?
- [ ] ¿Los iconos MDI usan prefijo `mdi-`?
- [ ] ¿Los iconos Material Icons no usan prefijo `mdi-`?
- [ ] ¿Los componentes nuevos usan la prop `icon`?
- [ ] ¿Los aliases personalizados comienzan con `$` al usarse en templates?
- [ ] ¿Si hay múltiples sets se usa `setName:iconName` para los no default?
- [ ] ¿No se está usando `all.js` de Font Awesome como si fuera CSS?
- [ ] ¿La solución evita hardcodear iconos repetidos cuando conviene alias?

---

## Ejemplo de refactor esperado

### Antes

```vue
<template>
  <v-btn>
    <v-icon>mdi-plus</v-icon>
    Crear
  </v-btn>

  <v-list-item
    title="Usuarios"
    prepend-icon="mdi-account-group"
  />

  <v-list-item
    title="Configuración"
    prepend-icon="mdi-cog"
  />
</template>
```

### Después

Configuración:

```ts
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const appIconAliases = {
  ...aliases,
  add: 'mdi-plus',
  users: 'mdi-account-group',
  settings: 'mdi-cog',
}

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: appIconAliases,
    sets: {
      mdi,
    },
  },
})
```

Template:

```vue
<template>
  <v-btn prepend-icon="$add">
    Crear
  </v-btn>

  <v-list-item
    title="Usuarios"
    prepend-icon="$users"
  />

  <v-list-item
    title="Configuración"
    prepend-icon="$settings"
  />
</template>
```

---

## Respuesta esperada de Codex

Cuando Codex aplique esta skill, debe explicar brevemente:

- Qué icon set configuró.
- Qué dependencia o CSS agregó.
- Qué aliases registró.
- Qué componentes o templates actualizó.
- Si usó múltiples sets, cuál quedó como default y cómo se referencian los demás.
- Si eligió no usar SVG o custom sets, explicar brevemente por qué.

Ejemplo:

"Configuré Vuetify para usar Material Design Icons mediante `vuetify/iconsets/mdi` y agregué la importación de `@mdi/font/css/materialdesignicons.css`. También extendí los aliases base de Vuetify con aliases semánticos como `$add`, `$users` y `$settings`, para evitar repetir nombres técnicos de iconos en los templates. Actualicé los usos de `v-icon` para usar la prop `icon`, que es la forma recomendada en Vuetify 3."
