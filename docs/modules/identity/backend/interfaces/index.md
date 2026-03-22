# Interfaces

## Propósito

`interfaces` define contratos de repositorio para cada agregado del dominio.

## Piezas principales

- `IUserRepository`
- `IRoleRepository`
- `ITenantRepository`
- `IUserApiKeyRepository`
- `IUserSessionRepository`
- `IUserLoginFailRepository`

Estos contratos son la base que consumen los servicios y que implementan los repositorios Mongo y SQLite.

## Cuándo usarlo

Usalo para extender el módulo con otra estrategia de persistencia o para testear servicios sin acoplarlos a una base concreta.
