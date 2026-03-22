# EmailTransportService

## Propósito

`EmailTransportService` prepara el transporte Nodemailer y ejecuta envíos.

## Modos soportados

- `smtp`
- `gmail`

## Qué hace

- inicializa el transporter en el constructor
- `prepareTransportGmail()` configura servicio Gmail
- `prepareTransportSmtp()` soporta transporte simple o pool con rate limiting
- `sendEmail()` valida `to`, `subject` y contenido antes de enviar

## Comportamiento útil

Si `from` no viene en `SendMailOptions`, usa el usuario autenticado del transporte configurado.
