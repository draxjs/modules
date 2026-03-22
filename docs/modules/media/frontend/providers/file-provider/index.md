# FileProvider

## Propósito

`FileProvider` expone un acceso estático al provider CRUD activo del módulo.

## Cómo funciona

- delega en `FileSystemFactory.getInstance()`
- devuelve un `IFileProvider`
