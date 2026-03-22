# SettingController

## Propósito

`SettingController` expone la API del módulo settings sin usar el controlador CRUD genérico.

## Endpoints lógicos

- `fetchAll()`: devuelve settings visibles según auth y permisos
- `fetchGrouped()`: agrupa settings por categoría y exige `setting:manage`
- `findByKey()`: devuelve una variable por clave validando visibilidad
- `updateValue()`: actualiza solo el valor y exige `setting:update`

## Reglas de visibilidad

- usuarios anónimos solo ven settings `public` sin `permission`
- usuarios autenticados ven settings sin permiso o con un permiso que ya posean
