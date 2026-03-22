# SettingEditor

## Propósito

`SettingEditor.vue` encapsula la edición modal de un setting individual.

## Qué hace

- clona el valor actual al abrirse
- valida con `v-form`
- usa `SettingField` en modo `editing`
- llama `updateSettingValue()` al guardar
