# FileRoutes

## Propósito

`FileRoutes` publica la API CRUD del recurso `File` en `/api/file`.

## Endpoints

- `GET /api/file`
- `GET /api/file/find`
- `GET /api/file/search`
- `GET /api/file/:id`
- `GET /api/file/find-one`
- `GET /api/file/group-by`
- `POST /api/file`
- `PUT /api/file/:id`
- `PATCH /api/file/:id`
- `DELETE /api/file/:id`
- `GET /api/file/export`

## Detalles

- usa `CrudSchemaBuilder(FileSchema, FileBaseSchema, FileBaseSchema, 'File', 'openapi-3.0', ['media'])`
- delega todas las operaciones en `FileController`
