# EmailLayoutServiceFactory

## Propósito

`EmailLayoutServiceFactory` crea una instancia singleton de `EmailLayoutService`.

## Cómo funciona

- lee opciones desde `DraxConfig` usando `EmailLayoutConfig`
- descarta valores vacíos, `null` o `undefined`
- crea el servicio una sola vez mediante `instance`

## Salida

Expone `getOptions` como layout tipado `IEmailLayout` y `instance` como servicio ya inicializado.
