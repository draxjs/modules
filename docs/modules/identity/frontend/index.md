# Identity Frontend

## Propósito

`identity-front` encapsula el consumo de la API de identidad para aplicaciones cliente, tanto por REST como por GraphQL.

## Secciones

- `errors`: errores específicos de autenticación del lado cliente.
- `factory`: selección de providers/systems según el transporte configurado.
- `helpers`: utilidades de JWT y auth en el navegador.
- `i18n`: mensajes de identidad para formularios y pantallas.
- `interfaces`: contratos de providers y payloads.
- `providers`: implementaciones REST y GraphQL.
- `system`: fachada orientada a aplicación sobre los providers.

## Cuándo usarlo

Usalo cuando una SPA o módulo Vue necesite trabajar con identidad sin acoplarse al detalle del transporte.
