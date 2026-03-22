# ITransportConfig

## Propósito

`TransportSmtpConfig` y `TransportGmailConfig` tipan las opciones del transporte de email.

## TransportSmtpConfig

Incluye:

- `host`, `port`, `secure`, `ignoreTLS`
- `rateDelta`, `rateLimit`
- `auth` con `type`, `user` y `pass`

## TransportGmailConfig

Incluye:

- `auth.user`
- `auth.pass`
- `rateDelta`, `rateLimit`
