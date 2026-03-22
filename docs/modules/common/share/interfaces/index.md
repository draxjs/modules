# Interfaces

## Propósito

Esta carpeta define contratos compartidos entre `common-front` y `common-vue`.

## Piezas principales

- `IDraxCommon`: interfaz base del paquete compartido.
- `IDraxDateFormatUnit`: unión de valores `year`, `month`, `day`, `hour`, `minute` y `second`.
- `ILink`: referencia mínima a una ruta por `name`.
- `IMenuItem`: estructura de menú con `icon`, `text`, `link`, `gallery`, `children`, `permission` y `auth`.

## Cuándo usarlo

Usalo para modelar menús navegables y granularidad de formato de fechas en componentes/composables.
