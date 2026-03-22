# Composables

## Propósito

`composables` encapsula el acceso reactivo a los systems de identidad y a los stores del módulo.

## Piezas principales

- `useAuth()`: login, logout, cambio de tenant, validación de token, permisos, recovery, registro y avatar.
- `useUser()`: paginación, creación, edición, borrado y cambio de contraseña de usuarios.
- `useRole()`: permisos, fetch/paginación y CRUD de roles.
- `useTenant()`: fetch/paginación y CRUD de tenants.
- `useUserApiKey()`: paginación y CRUD de API keys.

## Cuándo usarlo

Es la capa recomendada para componentes Vue porque ya resuelve acceso al system correcto y al store compartido.
