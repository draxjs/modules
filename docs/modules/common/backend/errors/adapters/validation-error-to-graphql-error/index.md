# ValidationErrorToGraphQLError

## Propósito

Transforma un `ValidationError` en `GraphQLError`.

## Qué preserva

Coloca `BAD_USER_INPUT` en `extensions.code` y reenvía `inputErrors` para que el cliente GraphQL pueda asociarlos a campos.
