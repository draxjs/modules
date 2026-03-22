# ServiceFactory

## Propósito

`TemplateServiceFactory` genera un singleton que crea el servicio con la implementación de repositorio adecuada.

## Qué decide

- Si `DraxConfig` indica MongoDB, usa el repositorio Mongo.
- Si indica SQLite, crea el repositorio SQLite, lo construye y lo inyecta.

## Valor práctico

Centraliza la selección del engine de persistencia y deja listo el servicio para controllers y otros consumidores.
