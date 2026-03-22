# RegistrationCompleteHtml

## Propósito

`RegistrationCompleteHtml` exporta un HTML estático usado al completar el proceso de registro.

## Qué contiene

- una página mínima con título `Registro Completo`
- estilos inline sencillos
- un enlace a `/login`

## Dónde se usa

`UserController` lo devuelve al finalizar la verificación de email.

## Cuándo usarlo

Conviene cuando el backend necesita responder una vista HTML simple de confirmación sin depender de un motor de templates.
