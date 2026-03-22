# UserEmailService

## Propósito

`UserEmailService` envía emails de verificación y recuperación de contraseña.

## Métodos

- `emailVerifyCode(emailCode, emailTo)`
  - construye un link `${baseurl}/api/users/verify-email/${emailCode}`
- `recoveryCode(recoveryCode, emailTo)`
  - construye un link `${baseurl}/password/recovery/complete/${recoveryCode}`

## Dependencias

- `EmailLayoutServiceFactory`
- `EmailTransportServiceFactory`
- `EmailTransportConfig.authUsername`
- `CommonConfig.BaseUrl`
