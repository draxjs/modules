# EntityRepositoryInterface

## Propósito

`TemplateEntityRepositoryInterface` genera `I<Entidad>Repository`, una interfaz que extiende `IDraxCrudRepository`.

## Cuándo usarlo

Sirve para tipar el repositorio concreto de la entidad y para desacoplar el servicio de la implementación Mongo o SQLite.
