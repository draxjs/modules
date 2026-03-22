# DashboardCombobox

## Propósito

`DashboardCombobox.vue` permite elegir un dashboard desde UI.

## Qué hace

- carga dashboards en `onMounted()`
- usa `DashboardProvider.instance.find({})`
- expone el valor mediante `defineModel`
- muestra el `title` y retorna el objeto completo
