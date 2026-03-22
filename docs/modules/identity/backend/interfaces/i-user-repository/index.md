# IUserRepository

## Propósito

`IUserRepository` define el contrato de persistencia de usuarios, incluyendo operaciones de autenticación y recuperación.

## Extiende

- `IDraxCrudRepository<IUser, IUserCreate, IUserUpdate>`

## Métodos específicos

- `findById`
- `findByUsername`
- `findByUsernameWithPassword`
- `findByIdWithPassword`
- `findByEmail`
- `changePassword`
- `changeAvatar`
- `findByEmailCode`
- `findByPhoneCode`
- `findByRecoveryCode`
