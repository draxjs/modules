# Common

## Propósito

`common` concentra piezas transversales que otros módulos de Drax reutilizan: utilidades de backend, clientes HTTP, contratos compartidos y componentes/composables para Vue.

## Submódulos disponibles

### Backend

Expone caché, configuración, manejo de errores, utilidades para Mongoose y SQL, helpers para GraphQL y almacenamiento de archivos.

### Frontend

Incluye clientes REST y GraphQL, jerarquía de errores, factories, helpers de fecha y debounce, además de mensajes i18n comunes.

### Share

Define contratos livianos que usan `front` y `vue`, especialmente estructuras de menú y unidades de formato de fecha.

### Vue

Agrupa componentes visuales reutilizables y composables para menús, validaciones i18n, copiado al portapapeles y formateo de fechas.

## Cómo se relacionan

- `common-share` define tipos como `IMenuItem` e `IDraxDateFormatUnit`.
- `common-vue` consume esos tipos en componentes y composables.
- `common-front` usa contratos y errores para encapsular transporte HTTP.
- `common-back` resuelve preocupaciones del servidor como caché, filtros y normalización de errores.
