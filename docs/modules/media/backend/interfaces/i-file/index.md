# IFile

## Propósito

`IFile` e `IFileBase` describen la metadata persistida del archivo.

## Campos principales

- `filename`, `relativePath`, `absolutePath`, `url`
- `description`, `tags`
- `mimetype`, `encoding`, `extension`, `size`, `type`
- `lastAccess`, `ttlSeconds`, `expiresAt`, `isPublic`, `hits`
- `createdBy`, `updatedBy`, `createdFor`, `tenant`

## Diferencia

- `IFileBase` representa el payload base
- `IFile` agrega `_id`
