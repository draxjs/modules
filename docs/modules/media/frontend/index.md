# Media Frontend

## Propósito

`media-front` encapsula el consumo cliente del módulo: upload, CRUD de metadata, factories por transporte e i18n.

## Secciones

- `factory`: selección de provider REST o GraphQL.
- `i18n`: textos de archivos y permisos.
- `interfaces`: contratos de providers.
- `providers`: implementaciones concretas por transporte.
- `system`: fachadas de alto nivel para archivos y uploads.

## Cuándo usarlo

Usalo cuando una app necesite subir archivos o consultar su metadata sin acoplarse al transporte HTTP concreto.
