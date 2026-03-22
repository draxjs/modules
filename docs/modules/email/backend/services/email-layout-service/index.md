# EmailLayoutService

## Propósito

`EmailLayoutService` compone el documento HTML del correo a partir de un body y un layout configurable.

## Qué hace

- define defaults razonables para body, header y footer
- expone `head`, `header` y `footer` como fragmentos HTML
- arma el documento final con `html(body)`

## Soporta

- header con imagen principal
- header con logo y título combinados
- footer con copyright, contenido adicional y unsubscribe
