# Arch

## Propósito

`arch` es el generador declarativo de Drax. A partir de un arreglo de `IEntitySchema` produce contratos TypeScript, esquemas backend, repositorios, servicios, rutas Fastify, providers REST, configuración CRUD, páginas Vue e i18n.

## Estructura real del paquete

Este módulo no está dividido en submódulos `back`, `front`, `share` o `vue` como el resto de Drax. En `packages/arch/src` la estructura real es:

- `generator`: orquesta la generación y contiene helpers y templates.
- `interfaces`: define el contrato `IEntitySchema` que describe cada entidad.
- `schemas`: incluye ejemplos mínimos de definición de entidades.

## Cómo se usa en un proyecto Drax

En un proyecto que usa Drax suele haber tres áreas separadas: `arch`, `back` y `front`.

- En `arch` se escriben los schemas declarativos.
- El generador toma esos schemas y escribe código en una salida organizada por módulo con carpetas `back` y `front`.
- Luego ese código generado se integra en el repositorio principal o se copia hacia los paquetes de aplicación.

El ejemplo más claro dentro del monorepo está en `packages/zuite/zuite-arch`:

- `src/index.ts` instancia `ArchGenerator` con varios schemas.
- `src/schemas/people/PersonSchema.ts`, `CountrySchema.ts` y `LanguageSchema.ts` modelan entidades reales del módulo `people`.
- Esos schemas muestran cómo declarar tabs, referencias, enums, objetos anidados, arrays de objetos, archivos y overrides de API.

## Flujo general

1. Definir una o más entidades con `IEntitySchema`.
2. Ejecutar `new ArchGenerator(schemas).build()`.
3. Consumir la salida generada por módulo en `output/<modulo>/back` y `output/<modulo>/front`.

## Secciones

- `generator`: corazón del módulo, con la clase principal, utilidades y templates.
- `interfaces`: tipos usados para describir entidades y campos.
- `schemas`: ejemplos simples de schemas de entrada.
