# Media

## Propósito

`media` centraliza la subida, descarga, registro y visualización de archivos en Drax.

## Submódulos disponibles

### Backend

Expone endpoints de upload/download, CRUD de metadata y persistencia para archivos.

### Frontend

Publica providers REST/GraphQL, sistemas cliente e i18n del módulo.

### Share

Define los contratos TypeScript de archivos y resultados de upload.

### Vue

Incluye campos de carga, vista de detalle, combobox, CRUD y rutas listas para integrar archivos en interfaces.

## Cómo se relacionan

- `media-share` define los tipos compartidos.
- `media-back` guarda metadata y gestiona el almacenamiento físico.
- `media-front` abstrae transporte y expone APIs orientadas a aplicación.
- `media-vue` monta widgets y pantallas para subir, listar y visualizar archivos.
