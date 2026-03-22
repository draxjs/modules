# TenantSystemFactory

## Propósito

`TenantSystemFactory` expone un singleton de `TenantSystem`.

## Qué hace

Selecciona `TenantGqlProvider` o `TenantRestProvider` en función del transporte configurado.
