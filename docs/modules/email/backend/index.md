# Email Backend

## Propósito

`email-back` implementa la capa reusable para envío de emails en Drax.

## Secciones

- `config`: enums con las claves de configuración del layout y del transporte.
- `factory`: crea servicios tipados a partir de `DraxConfig`.
- `interfaces`: contratos TypeScript del layout y del transporte.
- `services`: composición de HTML y envío con Nodemailer.

## Cuándo usarlo

Usalo cuando necesites enviar correos transaccionales o notificaciones desde backend con layout configurable por entorno.
