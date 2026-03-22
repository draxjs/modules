# Identity Backend

## Propósito

`identity-back` implementa el dominio de identidad del servidor: autenticación con JWT, autorización basada en roles y permisos, manejo de tenants, sesiones, API keys y recuperación de contraseña.

## Secciones

- `config`: claves de entorno específicas del módulo.
- `controllers`: endpoints REST para auth, usuarios, roles, tenants, sesiones y API keys.
- `errors`: errores propios como credenciales inválidas.
- `factory`: construcción de servicios según el motor de persistencia configurado.
- `graphql`: merge de schema y resolvers de identidad.
- `html`: plantillas HTML para flujos como verificación de registro.
- `interfaces`: contratos de repositorio por agregado.
- `middleware`: validación de JWT, API keys y permisos.
- `models`: modelos y schemas Mongo.
- `permissions`: catálogos de permisos por recurso.
- `rbac`: objeto de autorización para afirmar permisos, usuario y tenant.
- `repository`: implementaciones Mongo y SQLite.
- `routes`: registro de rutas Fastify y schemas OpenAPI.
- `schemas`: schemas Zod del dominio y payloads de auth.
- `services`: lógica de negocio principal.
- `setup`: bootstrap de config, permisos y datos semilla.
- `utils`: utilidades criptográficas y JWT.

## Cuándo usarlo

Usalo cuando el backend necesite centralizar autenticación y autorización reutilizable entre varios módulos, con soporte tanto para MongoDB como para SQLite.
