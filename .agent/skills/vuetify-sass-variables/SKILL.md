# Vuetify 3 SASS Variables Skill

## Objetivo

Ayudar a configurar y mantener personalizaciones de estilos de Vuetify 3 usando variables SASS/SCSS, priorizando una configuración clara, performante y segura para proyectos Vue 3.

Esta skill debe orientar a Codex para:

- Personalizar variables internas de Vuetify.
- Configurar correctamente `styles.configFile` en el plugin de Vuetify para Vite.
- Separar variables/configuración SASS de estilos CSS reales.
- Evitar duplicación de CSS.
- Deshabilitar utilidades o color packs cuando no sean necesarios.
- Considerar el impacto en performance de build.
- Usar `sass-embedded` y el compilador moderno cuando corresponda.

---

## Contexto técnico

Vuetify 3 usa SASS/SCSS internamente para construir sus estilos. Por defecto, Vuetify puede usar CSS precompilado, pero cuando se personalizan variables SASS pasa a compilar los archivos SASS base junto con el proyecto.

Esto permite modificar valores globales como:

- Tipografías.
- Tamaños de fuente.
- Line-height.
- Border radius.
- Spacing.
- Variables globales.
- Variables específicas de componentes.
- Generación de utility classes.
- Color packs.
- Cascade layers.

La personalización de variables SASS debe hacerse mediante un archivo de configuración, normalmente:

```txt
src/styles/settings.scss
```

---

## Instalación recomendada

Para poder personalizar variables SASS de Vuetify, instalar el preprocesador SASS.

### npm

```bash
npm install -D sass-loader sass
```

### pnpm

```bash
pnpm install -D sass-loader sass
```

### yarn

```bash
yarn add -D sass
```

### bun

```bash
bun add -D sass-loader sass
```

Cuando el proyecto use Vite y se busque mejorar performance de build, considerar reemplazar `sass` por `sass-embedded`.

```bash
npm remove sass
npm install -D sass-embedded
```

O con pnpm:

```bash
pnpm remove sass
pnpm install -D sass-embedded
```

---

## Configuración base con Vite

La configuración recomendada es declarar el archivo SASS de settings en el plugin de Vuetify.

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
})
```

`configFile` se resuelve relativo a la raíz del proyecto y se carga antes de cada stylesheet de Vuetify.

---

## Archivo settings.scss

Crear el archivo:

```txt
src/styles/settings.scss
```

Ejemplo base:

```scss
// src/styles/settings.scss

@use 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif),
  $border-radius-root: 12px
);
```

---

## Regla importante sobre valores con coma

Cuando una variable contiene una lista con comas, como una familia tipográfica, envolver el valor entre paréntesis.

Correcto:

```scss
@use 'vuetify/settings' with (
  $body-font-family: ('Roboto', sans-serif)
);
```

Incorrecto:

```scss
@use 'vuetify/settings' with (
  $body-font-family: 'Roboto', sans-serif
);
```

---

## No usar vuetify/styles dentro de SASS

No importar `vuetify/styles` dentro de archivos SASS/SCSS, porque resuelve a CSS precompilado.

Incorrecto:

```scss
@use 'vuetify/styles';
```

Correcto:

```scss
@use 'vuetify/settings' with (
  // variables
);
```

También es válido usar:

```scss
@use 'vuetify' with (
  // variables específicas como $utilities, $color-pack o $reset
);
```

Pero `@use 'vuetify'` debe reservarse principalmente para configuraciones como:

- `$utilities`
- `$color-pack`
- `$reset`

---

## Cuándo usar @use y cuándo usar @forward

### Usar @use para configurar Vuetify internamente

```scss
@use 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif)
);
```

### Usar @forward cuando otros archivos o componentes Vue necesiten importar variables

Si se necesitan usar variables de Vuetify en templates o estilos de componentes, cambiar `@use` por `@forward`.

```scss
// src/styles/settings.scss

@forward 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif)
);
```

Luego, desde un componente:

```vue
<style lang="scss" scoped>
@use '@/styles/settings' as settings;

.custom-title {
  font-family: settings.$body-font-family;
}
</style>
```

Usar este patrón solo cuando realmente se necesite consumir variables SASS desde componentes propios.

---

## Evitar CSS duplicado

El archivo `settings.scss` puede ser importado múltiples veces por Vuetify o por componentes propios. Por eso no debe contener reglas CSS reales.

Correcto:

```scss
// src/styles/settings.scss

@use 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif),
  $border-radius-root: 12px
);
```

Incorrecto:

```scss
// src/styles/settings.scss

@use 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif)
);

.app-card {
  border: 1px solid red;
}
```

Los estilos reales deben ir en otro archivo, por ejemplo:

```txt
src/styles/main.scss
```

```scss
// src/styles/main.scss

.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

---

## Patrón recomendado de archivos

```txt
src/
  plugins/
    vuetify.ts
  styles/
    settings.scss
    main.scss
```

### vuetify.ts

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@/styles/main.scss'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
  },
})
```

### settings.scss

```scss
// src/styles/settings.scss

@use 'vuetify/settings' with (
  $body-font-family: ('Inter', sans-serif),
  $border-radius-root: 12px
);
```

### main.scss

```scss
// src/styles/main.scss

.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

---

## Deshabilitar utility classes

Vuetify genera muchas utility classes. Si el proyecto no las usa, se pueden deshabilitar para reducir CSS.

### Deshabilitar todas las utilities

```scss
// src/styles/main.scss

@use 'vuetify' with (
  $utilities: false
);
```

### Deshabilitar utilities específicas

```scss
// src/styles/main.scss

@use 'vuetify' with (
  $utilities: (
    'display': false,
    'float': false,
    'flex': false,
    'margin': false,
    'padding': false,
    'text-align': false,
    'typography': false
  )
);
```

### Deshabilitar estilos misc

Algunas clases no están dentro del mapa `$utilities`, como:

- `elevation`
- `hidden`
- `sr-only`
- `pointer-events`

Para esas clases usar `$misc`.

```scss
@use 'vuetify' with (
  $misc: (
    'elevation': false,
    'hidden': false,
    'sr-only': false,
    'pointer-events': false
  )
);
```

---

## Deshabilitar color packs

Los color packs permiten usar clases rápidas de color, pero muchas veces no se usan en producción.

Para deshabilitarlos:

```scss
// src/styles/main.scss

@use 'vuetify' with (
  $color-pack: false
);
```

Usar esta opción cuando el proyecto maneje colores principalmente mediante el sistema de temas de Vuetify o clases propias.

---

## Cascade layers

Vuetify permite habilitar CSS cascade layers.

Esto puede ayudar a escribir estilos personalizados con menos conflictos de especificidad y menor necesidad de `!important`.

### settings.scss

```scss
// src/styles/settings.scss

@forward 'vuetify/settings' with (
  $layers: true
);
```

### vuetify.ts

```ts
// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    layers: true,
  },
})
```

### Orden de imports

Cuando se usan layers, el orden de carga es importante.

`import 'vuetify/styles'` o un archivo que contenga `@use 'vuetify'` debe cargarse antes que componentes o estilos propios.

Ejemplo recomendado:

```ts
import 'vuetify/styles'
import '@/styles/main.scss'
```

Se puede definir un orden explícito de layers:

```css
@layer base, vuetify, overrides;
```

---

## Build performance

Personalizar variables SASS tiene un costo.

Por defecto, Vuetify puede usar CSS precompilado. Cuando se habilita personalización de variables SASS, Vuetify cambia a los archivos SASS base, que deben recompilarse junto con el proyecto.

Esto puede afectar el tiempo de build, especialmente si el proyecto usa muchos componentes Vuetify.

También obliga a usar una versión compatible del compilador SASS.

### Recomendación para Vite

Para mejorar performance con Vite:

1. Usar Vite `5.4` o superior.
2. Reemplazar `sass` por `sass-embedded`.
3. Configurar `css.preprocessorOptions.sass.api` como `'modern-compiler'`.

Ejemplo:

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
```

Instalación:

```bash
npm remove sass
npm install -D sass-embedded
```

---

## Symlinks con pnpm o Yarn 2+

pnpm y Yarn 2+ suelen crear symlinks hacia archivos de librerías en lugar de copiar todo directamente dentro de `node_modules`.

SASS puede tener problemas con estos symlinks y, en algunos casos, no aplicar correctamente la configuración.

Si aparecen problemas raros con variables que no se aplican:

1. Verificar que `styles.configFile` apunte al archivo correcto.
2. Verificar que no haya errores de resolución de paths.
3. Probar con `sass-embedded`.
4. Revisar si el entorno de package manager usa symlinks.
5. Validar que el archivo `settings.scss` no contenga CSS real.

---

## sass-loader con api modern

En algunos casos, al usar `sass-loader` con `api: 'modern'`, puede ser necesario crear un importer personalizado para cargar el archivo de settings.

Codex no debe aplicar esta solución de entrada. Solo debe sugerirla cuando:

- El proyecto use Webpack.
- El proyecto use `sass-loader`.
- La configuración con `configFile` no esté funcionando.
- Haya evidencia de problemas de resolución de imports.

---

## Relación con themes de Vuetify

No confundir variables SASS con el sistema de themes.

### Usar theme cuando:

- Se quieren configurar colores semánticos.
- Se quiere manejar light/dark mode.
- Se quieren exponer colores como CSS variables.
- Se necesita cambiar el tema en runtime.

Ejemplo:

```ts
createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
        },
      },
    },
  },
})
```

### Usar SASS variables cuando:

- Se quieren cambiar defaults internos del framework.
- Se quieren modificar variables estructurales.
- Se quiere controlar utilities, color packs, reset o layers.
- Se quiere ajustar tipografías o estilos internos antes de compilar CSS.

---

## Buenas prácticas

### Mantener settings.scss limpio

El archivo `settings.scss` debe contener solo:

- Variables.
- Mixins.
- Functions.
- `@use` o `@forward` de Vuetify settings.

No debe contener:

- Clases CSS.
- Selectores.
- Imports de CSS regular.
- Estilos de componentes propios.

---

### Preferir theme para colores de negocio

Si la personalización es de color semántico, preferir `theme.colors`.

```ts
createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#0057D9',
          secondary: '#00A884',
        },
      },
    },
  },
})
```

No usar variables SASS para resolver cambios de color que deberían poder cambiar en runtime.

---

### Evitar personalización SASS innecesaria

Antes de agregar `settings.scss`, evaluar si se puede resolver con:

- `defaults` de Vuetify.
- `theme` de Vuetify.
- CSS global.
- Clases utilitarias.
- Wrapper components.

Usar SASS variables solo cuando el cambio realmente necesita modificar la base interna de Vuetify.

---

## Instrucciones para Codex

Cuando el usuario pida personalizar estilos de Vuetify mediante SASS variables:

1. Verificar si el proyecto usa Vuetify 3.
2. Verificar si usa Vite, Webpack o Vue CLI.
3. Si usa Vite, configurar `vite-plugin-vuetify` con `styles.configFile`.
4. Crear o actualizar `src/styles/settings.scss`.
5. Usar `@use 'vuetify/settings' with (...)` para overrides simples.
6. Usar `@forward 'vuetify/settings' with (...)` si se necesitan consumir variables desde componentes.
7. No agregar CSS real dentro de `settings.scss`.
8. No usar `vuetify/styles` dentro de archivos SASS.
9. Si hay valores con coma, envolverlos entre paréntesis.
10. Si se habilita personalización SASS en proyectos grandes, advertir posible impacto en build.
11. Para Vite, sugerir `sass-embedded` y `api: 'modern-compiler'` cuando haya problemas de performance.
12. Diferenciar claramente cuándo conviene usar `theme`, `defaults`, CSS global o SASS variables.
13. No deshabilitar utilities o color packs sin validar que el proyecto no dependa de esas clases.

---

## Checklist de revisión

Antes de finalizar una implementación, validar:

- [ ] ¿Existe `src/styles/settings.scss`?
- [ ] ¿`vite-plugin-vuetify` tiene `styles.configFile` configurado?
- [ ] ¿El archivo `settings.scss` usa `@use 'vuetify/settings'` o `@forward 'vuetify/settings'`?
- [ ] ¿No se importó `vuetify/styles` dentro de SASS?
- [ ] ¿Los valores con coma están entre paréntesis?
- [ ] ¿No hay CSS real dentro de `settings.scss`?
- [ ] ¿Los estilos CSS reales están en `main.scss` u otro archivo dedicado?
- [ ] ¿Se evaluó si correspondía usar `theme` o `defaults` en lugar de SASS variables?
- [ ] ¿Se consideró el impacto en performance de build?
- [ ] ¿Si el build está lento en Vite, se sugirió `sass-embedded`?
- [ ] ¿Si se usan cascade layers, el orden de imports es correcto?
- [ ] ¿No se deshabilitaron utilities/color packs sin revisar impacto?

---

## Ejemplo de refactor esperado

### Antes

Estilos repetidos y mezclados sin configuración central:

```scss
// src/styles/main.scss

.v-btn {
  border-radius: 12px;
}

.v-card {
  border-radius: 16px;
}
```

### Después

Configuración de variables SASS:

```scss
// src/styles/settings.scss

@use 'vuetify/settings' with (
  $border-radius-root: 12px,
  $body-font-family: ('Inter', sans-serif)
);
```

Configuración Vite:

```ts
// vite.config.ts

vuetify({
  styles: {
    configFile: 'src/styles/settings.scss',
  },
})
```

CSS real separado:

```scss
// src/styles/main.scss

.app-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

---

## Respuesta esperada de Codex

Cuando Codex aplique esta skill, debe explicar brevemente:

- Qué archivo de settings creó o modificó.
- Qué variables SASS cambió.
- Cómo conectó `settings.scss` con Vuetify.
- Si usó `@use` o `@forward` y por qué.
- Si separó CSS real de variables.
- Si hay impacto posible en performance de build.
- Si recomendó `sass-embedded` o configuración moderna de SASS.

Ejemplo:

"Configuré `src/styles/settings.scss` usando `@use 'vuetify/settings' with (...)` para centralizar variables SASS de Vuetify. También conecté ese archivo desde `vite.config.ts` mediante `styles.configFile`. Dejé los estilos CSS reales fuera de `settings.scss` para evitar duplicación. Como esta configuración hace que Vuetify compile desde SASS base en lugar de usar CSS precompilado, puede impactar en el tiempo de build; para Vite conviene evaluar `sass-embedded` con `api: 'modern-compiler'`."
