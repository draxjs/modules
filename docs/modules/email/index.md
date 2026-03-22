# Email

## Propósito

`email` concentra la infraestructura backend para construir layouts HTML de correos y enviarlos mediante configuraciones SMTP o Gmail.

## Submódulos disponibles

### Backend

Incluye enums de configuración, factories de servicios, contratos de layout/transporte y servicios concretos para renderizar HTML y enviar emails.

## Cómo se relacionan

- `config` define qué variables de entorno usa el módulo
- `factory` lee esa configuración y crea los servicios listos para usar
- `interfaces` tipa layout y transporte
- `services` renderiza el HTML final y ejecuta el envío con Nodemailer
