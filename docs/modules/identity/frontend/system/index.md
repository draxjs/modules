# System

## Propósito

La carpeta `system` ofrece una fachada orientada a casos de uso, por encima de los providers.

## Piezas principales

- `AuthSystem`
- `UserSystem`
- `RoleSystem`
- `TenantSystem`
- `UserApiKeySystem`
- `UserSessionSystem`
- `UserLoginFailSystem`

Cada system delega en su provider, mantiene una API estable para la aplicación y agrega pequeños ajustes de ergonomía.

## Cuándo usarlo

Es la capa recomendada para composables y stores, porque evita acoplarlos a REST o GraphQL.
