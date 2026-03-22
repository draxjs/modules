# CreateOrUpdateRole

## Propósito

`CreateOrUpdateRole` asegura que un rol exista y, si ya existe, lo actualiza.

## Qué hace

- busca el rol por `name`
- si `childRoles` contiene nombres, intenta resolverlos a IDs reales
- si el rol existe, usa `roleService.systemUpdate`
- si no existe, usa `roleService.create`
