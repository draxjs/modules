# AuthSystemFactory

## Propósito

`AuthSystemFactory` crea un singleton de `AuthSystem`.

## Qué hace

Según `VITE_HTTP_TRANSPORT`, instancia `AuthGqlProvider` o `AuthRestProvider` usando los clientes de `@drax/common-front`.
