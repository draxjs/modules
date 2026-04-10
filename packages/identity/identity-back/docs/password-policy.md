# Password Policy

La policy efectiva se resuelve con esta prioridad:

```ts
const finalPolicy = {
  ...defaultPasswordPolicy,
  ...projectPolicy,
  ...envPolicy
}
```

## Fuentes

- `defaultPasswordPolicy`: `src/security/constants/defaultPasswordPolicy.ts`
- `projectPolicy`: override opcional in-memory vía `projectContext`
- `envPolicy`: variables declaradas en `src/config/PasswordPolicyConfig.ts`

## Endpoint

- `GET /api/auth/password-policy`

Devuelve la policy efectiva para que frontend pueda mostrar requisitos de password antes de enviar formularios.

## Validación

- Formato: `PasswordPolicySchemaFactory` genera un `ZodType<string>` dinámico
- Negocio: `PasswordPolicyService` aplica `preventReuse` y expone base para `expirationDays`

## Notas

- `preventReuse` usa persistencia en `user_password_history`
- `expirationDays` ya forma parte de la policy efectiva y del servicio, pero en esta primera versión queda informativo; no bloquea login todavía
