# Factory

## Propósito

La carpeta construye `systems` de identidad y decide si usar providers REST o GraphQL según `VITE_HTTP_TRANSPORT`.

## Piezas principales

- `AuthSystemFactory`
- `UserSystemFactory`
- `RoleSystemFactory`
- `TenantSystemFactory`
- `UserApiKeySystemFactory`
- `UserSessionSystemFactory`
- `UserLoginFailSystemFactory`

Cada factory obtiene el cliente HTTP común correspondiente, instancia el provider adecuado y lo envuelve en su `System`.

## Cuándo usarlo

Usalo como punto de entrada estándar desde composables o componentes para no decidir manualmente el transporte.
