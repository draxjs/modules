# EmailTransportServiceFactory

## Propósito

`EmailTransportServiceFactory` crea la instancia singleton de `EmailTransportService`.

## Cómo decide

- si `EMAIL_TYPE` es `smtp`, arma `TransportSmtpConfig`
- si `EMAIL_TYPE` es `gmail`, arma `TransportGmailConfig`
- en cualquier otro caso lanza error por tipo no soportado

## Resultado

Expone `instance`, `getType` y `getOptions` basados en `DraxConfig`.
