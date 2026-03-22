# Settings

## Propósito

`settings` centraliza variables de configuración editables en tiempo de ejecución, con control de visibilidad pública, permisos y presentación en UI.

## Submódulos disponibles

### Backend

Expone consulta, agrupación y actualización de settings, con persistencia en Mongo o SQLite.

### Frontend

Publica providers cliente e i18n del módulo.

### Share

Define los contratos TypeScript del dominio `Setting`.

### Vue

Incluye componentes, composables, store y páginas para visualizar y editar settings agrupados por categoría.

## Cómo se relacionan

- `settings-share` define el shape de cada variable.
- `settings-back` aplica permisos y persiste los cambios.
- `settings-front` abstrae el transporte REST o GraphQL.
- `settings-vue` consume esos providers para construir pantallas de configuración.
