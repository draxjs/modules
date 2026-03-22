# IdentityUserGroupBy

## Propósito

`IdentityUserGroupBy.vue` muestra un resumen agrupado de usuarios por rol.

## Qué hace

Usa `UserSystemFactory.getInstance().groupBy({ fields: ['role'] })` y transforma el resultado en tarjetas con contador, icono y color del rol.
