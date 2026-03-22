# Middleware

## Propósito

La carpeta contiene middlewares de seguridad para autenticar requests y evaluar permisos.

## Piezas principales

- `jwtMiddleware`: lee `Authorization: Bearer ...`, verifica el token y deja `request.authUser` y `request.token`.
- `rbacMiddleware`: construye el contexto RBAC y valida permisos sobre la request.
- `apiKeyMiddleware`: soporta autenticación por API key para integraciones server-to-server.

## Cuándo usarlo

Conviene al registrar rutas Fastify que deban autenticar usuarios o API keys antes de llegar al controlador.
