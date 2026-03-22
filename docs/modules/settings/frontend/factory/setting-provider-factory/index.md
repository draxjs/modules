# SettingProviderFactory

## Propósito

`SettingProviderFactory` crea una única instancia de `ISettingProvider`.

## Cómo decide

- con `GRAPHQL` usa `SettingGqlProvider`
- con `REST` usa `SettingRestProvider`
- toma el transporte desde `VITE_HTTP_TRANSPORT` por default
