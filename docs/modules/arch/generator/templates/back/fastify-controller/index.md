# FastifyController

## Propósito

`TemplateFastifyController` genera un controller basado en `AbstractFastifyController`.

## Qué resuelve

- Inyecta la instancia del servicio y los permisos de la entidad.
- Detecta automáticamente campos de tenant y usuario.
- Activa filtros, setters y asserts multi-tenant cuando la entidad declara `tenant`, `user` o `createdBy`.

## Valor práctico

Evita repetir la configuración estándar de controllers CRUD por entidad.
