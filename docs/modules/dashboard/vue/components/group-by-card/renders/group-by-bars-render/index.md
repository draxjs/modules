# GroupByBarsRender

## Propósito

`GroupByBarsRender.vue` dibuja un gráfico de barras en canvas para datos `groupBy`.

## Qué hace

- calcula `totalCount` y `maxValue`
- transforma cada fila en label, valor, porcentaje y color
- dibuja ejes, grilla, barras y etiquetas
- se redibuja al cambiar los datos o el tamaño de la ventana
