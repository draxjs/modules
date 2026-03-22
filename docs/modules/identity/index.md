# Identity

## Propósito

`identity` concentra el dominio de autenticación y autorización de Drax: login, JWT, cambio de tenant, usuarios, roles, sesiones, fallos de login y API keys.

## Submódulos disponibles

### Backend

Implementa servicios, controladores, rutas, middleware y repositorios para exponer identidad por REST y GraphQL.

### Frontend

Encapsula providers REST/GraphQL, systems, helpers e interfaces para consumir el backend de identidad desde aplicaciones cliente.

### Share

Publica los contratos TypeScript del dominio: usuarios, roles, tenants, sesiones, JWT y RBAC.

### Vue

Aporta componentes, páginas, stores, composables y definiciones CRUD listas para construir UIs de autenticación y administración de identidad.

## Cómo se relacionan

- `identity-share` define las entidades y payloads que usan el resto de los submódulos.
- `identity-back` produce tokens, aplica permisos y persiste usuarios, roles, tenants y sesiones.
- `identity-front` abstrae el transporte y expone APIs orientadas a aplicación con providers y systems.
- `identity-vue` consume `identity-front` y `identity-share` para montar flujos de login, perfil y CRUDs administrativos.
