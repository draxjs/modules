---
name: drax-docs
description: Crear o actualizar la documentación de módulos de Drax en el subproyecto VitePress ubicado en docs/. Usar cuando el usuario pida documentar un módulo completo o un submódulo específico de Drax, ajustar el menú nav/sidebar de VitePress, crear la estructura de archivos en docs/modules, o redactar documentación técnica en español a partir del código fuente real de los paquetes Drax organizados por módulo y submódulo back, front, share o vue.
---

# Drax Docs

Documentar siempre a partir del código real del repositorio. No inventar carpetas, clases, servicios ni ejemplos que no existan o no sean consistentes con la implementación.

## Resolver el pedido

Interpretar el alcance exacto del usuario:

- Si pide un módulo completo, revisar todos los submódulos existentes del módulo.
- Si pide un submódulo concreto, revisar solo ese submódulo y actualizar la documentación afectada.
- Si el módulo no tiene alguno de los submódulos esperados (`back`, `front`, `share`, `vue`), documentar solo los que existan.

Usar esta convención de mapeo:

- Código fuente: `packages/<modulo>/<modulo>-back`, `packages/<modulo>/<modulo>-front`, `packages/<modulo>/<modulo>-share`, `packages/<modulo>/<modulo>-vue`
- Rutas de documentación: `/modules/<modulo>/backend`, `/modules/<modulo>/frontend`, `/modules/<modulo>/share`, `/modules/<modulo>/vue`
- Etiquetas visibles: `Backend`, `Frontend`, `Share`, `Vue`

Mapear `back -> backend` y `front -> frontend` solo en la documentación. Mantener `share` y `vue` sin cambios.

## Inspeccionar la estructura real

Antes de escribir contenido:

1. Leer `docs/.vitepress/config.mts`.
2. Leer `docs/index.md`.
3. Identificar el módulo objetivo dentro de `packages/<modulo>/`.
4. Detectar qué submódulos existen realmente.
5. Para cada submódulo existente, listar las carpetas inmediatas dentro de `src/`. Cada carpeta representa una sección documentable del menú y del árbol de `docs/modules`.

Ignorar `dist`, `types`, `test`, `node_modules` y otros directorios generados. La estructura documental debe derivarse de `src/`.

## Mantener VitePress coherente

Actualizar `docs/.vitepress/config.mts` para que el menú refleje la estructura real de Drax.

### Nav

Agregar un item por cada módulo documentado:

```ts
nav: [
  { text: 'Home', link: '/' },
  { text: 'Common', link: '/modules/common/' },
  { text: 'Identity', link: '/modules/identity/' }
]
```

Usar el nombre visible capitalizado.

### Sidebar

Usar siempre `sidebar` como `SidebarMulti` por prefijo de ruta, no como una lista plana global. Cada módulo debe tener su propia rama independiente para que al entrar en `/modules/common/` solo se vea `Common`, en `/modules/identity/` solo se vea `Identity`, etc.

Patrón recomendado:

```ts
sidebar: {
  '/modules/common/': [
    { text: 'Common', link: '/modules/common/' },
    {
      text: 'Backend',
      link: '/modules/common/backend',
      items: [
        { text: 'Cache', link: '/modules/common/backend/cache' }
      ]
    }
  ],
  '/modules/identity/': [
    { text: 'Identity', link: '/modules/identity/' }
  ]
}
```

Dentro de cada módulo:

- Incluir como primer item el nombre visible del módulo, apuntando a `/modules/<modulo>/`
- Incluir un item por cada submódulo existente
- Dentro de `Backend`, `Frontend` y `Vue`, agregar un item por cada carpeta inmediata de `src/`
- En `Share`, exponer al menos la portada del submódulo; agregar items internos solo si el `src/` tiene carpetas diferenciadas que merezcan navegación propia

Mantener consistencia entre:

- `docs/.vitepress/config.mts`
- `docs/modules/**`
- Carpetas reales de `packages/**/src`

No dejar links en la sidebar que apunten a páginas inexistentes.

## Mantener la home

Actualizar `docs/index.md` para agregar cada módulo dentro de `features`, con:

- Nombre del módulo
- Breve descripción funcional en español
- `link` apuntando a `/modules/<modulo>/`
- `linkText` corto, por ejemplo `Ir al modulo`

Ejemplo:

```md
features:
  - title: Module Common
    details: Utilidades compartidas de backend, frontend, tipos comunes y componentes Vue reutilizables.
    link: /modules/common/
    linkText: Ir al modulo
```

Escribir descripciones concretas según el código real del módulo, no texto genérico.

## Crear la estructura de directorios en docs/modules

Mantener esta base:

```text
docs/modules/<modulo>/
docs/modules/<modulo>/index.md
docs/modules/<modulo>/backend/index.md
docs/modules/<modulo>/frontend/index.md
docs/modules/<modulo>/share/index.md
docs/modules/<modulo>/vue/index.md
```

Luego, por cada carpeta inmediata dentro de `src/` del submódulo correspondiente, crear una carpeta documental equivalente:

```text
docs/modules/<modulo>/backend/cache/index.md
docs/modules/<modulo>/backend/errors/index.md
docs/modules/<modulo>/frontend/clients/index.md
docs/modules/<modulo>/vue/components/index.md
```

Ademas, dentro de cada carpeta documentada, considerar crear subpaginas por archivo publico significativo cuando mejore la navegacion. Esto aplica especialmente a carpetas con varias clases, componentes, composables, stores, providers, services o helpers relevantes.

Ejemplo:

```text
docs/modules/crud/vue/stores/index.md
docs/modules/crud/vue/stores/use-crud-store/index.md
docs/modules/crud/vue/stores/use-entity-store/index.md
docs/modules/crud/vue/stores/use-group-by-store/index.md
```

Si se crean estas subpaginas, agregarlas tambien como `items` hijos en la `sidebar` de esa carpeta.

Si el pedido es parcial, crear o actualizar solo la parte afectada, pero sin romper la coherencia general del árbol.

## Redactar la documentación

Escribir siempre en español.

Para cada módulo:

- Explicar el propósito general del módulo
- Explicar qué responsabilidad tiene cada submódulo existente
- Resumir cómo se relacionan `back`, `front`, `share` y `vue`

Para cada submódulo:

- Explicar el contexto de uso
- Explicar la responsabilidad de cada carpeta de `src/`
- Enumerar y describir las clases, funciones, componentes, adapters, interfaces o helpers relevantes

Para cada carpeta documentada:

1. Leer los archivos fuente de esa carpeta.
2. Identificar exportaciones principales.
3. Explicar para qué sirve cada pieza.
4. Aclarar en qué contexto tiene sentido usarla.
5. Incluir ejemplo de uso cuando aporte valor y pueda derivarse del código real.
6. Si hay múltiples archivos relevantes y navegables, evaluar crear una subpagina por archivo y reflejarlo en la sidebar.

Ejemplo de análisis esperado:

- `packages/common/common-back/src/cache`
  - Explicar `DraxCache`
  - Explicar `LocalCacheAdapter`
  - Explicar `RedisCacheAdapter`
  - Aclarar cuándo conviene cada adapter
  - Incluir ejemplo de integración si la API es clara en el código

- `packages/common/common-back/src/errors`
  - Explicar `BadRequestError`, `ForbiddenError`, `InternalServerError`, etc.
  - Aclarar cuándo lanzar cada error y qué problema resuelve

No limitarse a listar archivos. Interpretar el diseño y documentar intención, responsabilidades y relaciones.

## Estructura sugerida de cada página

Usar una estructura simple y consistente:

```md
# Cache

## Propósito

## Piezas principales

## Cuándo usarlo

## Ejemplos
```

Si una carpeta contiene muchas piezas, agruparlas por responsabilidad.

## Reglas para ejemplos

Generar ejemplos solo si:

- La API pública es suficientemente clara
- El ejemplo puede inferirse con seguridad del código
- El ejemplo agrega valor práctico

Mantener los ejemplos pequeños y realistas. Si hay ambigüedad, explicar el comportamiento sin inventar llamadas dudosas.

## Manejar pedidos parciales

Aceptar pedidos como:

- `documentar common`
- `documentar common-back`
- `documentar identity-vue`
- `actualizar la documentación de common/frontend/clients`

Resolverlos así:

- Si el pedido apunta a módulo completo, revisar todo el módulo.
- Si apunta a submódulo, revisar solo ese paquete y su rama documental.
- Si apunta a una carpeta interna, revisar solo esa carpeta y validar que la sidebar siga consistente.

## Checklist de salida

Antes de terminar:

1. Verificar que `docs/.vitepress/config.mts` tenga `nav` y `sidebar` coherentes.
2. Verificar que `docs/index.md` incluya el módulo en `features`.
3. Verificar que exista la estructura en `docs/modules/<modulo>/...`.
4. Verificar que cada link del menú tenga su archivo `index.md`.
5. Verificar que el contenido esté en español y surja del código real.
6. Verificar que no queden placeholders como `Lorem ipsum`, `continue...` o listas incompletas.
