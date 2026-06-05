---
name: drax-media
description: Explain and apply the Drax media backend module for file management. Use when a project needs to upload, download, delete, register, query, or delegate file handling to @drax/media-back, especially MediaService, FileService, FileServiceFactory, MediaRoutes, FileRoutes, MediaPermissions, or FilePermissions.
---

# Drax Media

Use this skill to help an agent integrate file management through `@drax/media-back` instead of reimplementing storage, metadata, routing, or RBAC behavior.

## Source Map

Read these files when details matter:

- `packages/media/media-back/src/services/MediaService.ts`: physical file workflow plus metadata registration.
- `packages/media/media-back/src/services/FileService.ts`: metadata CRUD service and delete hook.
- `packages/media/media-back/src/factory/services/FileServiceFactory.ts`: singleton service with MongoDB/SQLite repository selection.
- `packages/media/media-back/src/controllers/MediaController.ts`: upload/download/delete endpoint behavior.
- `packages/media/media-back/src/controllers/FileController.ts`: metadata CRUD controller behavior, tenant/user scoping.
- `packages/media/media-back/src/routes/MediaRoutes.ts`: binary file endpoints under `/api/file`.
- `packages/media/media-back/src/routes/FileRoutes.ts`: metadata CRUD endpoints under `/api/file`.
- `packages/media/media-back/src/interfaces/IFile.ts`, `schemas/FileSchema.ts`, `models/FileModel.ts`: metadata shape.
- `packages/media/media-back/src/permissions/MediaPermissions.ts`, `FilePermissions.ts`: required permissions.

## Choose The Right API

Prefer `MediaService` when the project handles the actual file stream or filesystem path lifecycle:

```ts
import {MediaService} from "@drax/media-back";

const mediaService = new MediaService();
const saved = await mediaService.saveFile({
    dir: "invoices",
    file: {
        filename: upload.filename,
        fileStream: upload.file,
        mimetype: upload.mimetype,
        encoding: upload.encoding,
    },
    createdBy: {
        id: request.rbac.userId,
        username: request.rbac.username,
    },
});
```

Prefer `FileServiceFactory.instance` when the project only needs to query, update, or delete file metadata records:

```ts
import {FileServiceFactory} from "@drax/media-back";

const metadata = await FileServiceFactory.instance.findOneBy("relativePath", relativePath);
await FileServiceFactory.instance.updatePartial(metadata._id, {
    description: "Signed contract",
    tags: ["contracts", "signed"],
});
```

Avoid direct repository/model usage unless implementing Drax internals. The factory already chooses the repository from `DraxConfig` and validates through `FileBaseSchema`/`FileSchema`.

## MediaService Behavior

Use `saveFile({dir, file, createdBy?, date?})` to persist an upload and register metadata.

- Validates `dir` with `/^[a-zA-Z0-9_-]+$/`; reject nested paths, dots, or path traversal.
- Stores files under `${CommonConfig.FileDir || "files"}/${dir}/${year}/${month}`.
- Builds URL as `${CommonConfig.BaseUrl}/api/file/${dir}/${year}/${month}/${filename}`.
- Returns storage details: `filename`, `path`, `relativePath`, `absolutePath`, `fileDir`, `extension`, `type`, `url`, `size`, `mimetype`.
- Registers metadata through `FileServiceFactory.instance.registerUploadedFile` unless `DRAX_FILE_METADATA` disables metadata.
- Deletes the physical file if metadata registration fails, keeping storage and metadata consistent.

Use `getFile({dir, year, month, filename, registerHit?})` to resolve a stored file for download.

- Validates `dir`, `year` as four digits, and `month` as two digits.
- Verifies the file exists and throws `NotFoundError("File not found")` when missing.
- Increments `hits` and updates `lastAccess` through `FileServiceFactory.instance.registerDownloadHit(relativePath)` by default.
- Set `registerHit: false` for internal reads that should not affect analytics.

Use `deleteFile({dir, year, month, filename, deleteMetadata?})` or `deleteFileByRelativePath({relativePath, deleteMetadata?})` to delete files.

- Default `deleteMetadata` is `true`.
- If metadata exists and `deleteMetadata` is true, `FileService.delete(id)` is used, which also deletes the physical file via the service delete hook.
- If metadata does not exist or metadata deletion is disabled, `StoreManager.deleteFilepath(relativePath)` deletes the physical file directly.

## FileService Behavior

`FileService` extends `AbstractService<IFile, IFileBase, IFileBase>` and should be treated as the metadata service for stored files.

Important methods:

- `registerUploadedFile(data: IFileBase)`: creates a metadata record.
- `registerDownloadHit(relativePath: string)`: finds by `relativePath`, increments `hits`, updates `lastAccess`, returns `null` when no metadata exists.
- inherited CRUD methods: `create`, `paginate`, `find`, `findOneBy`, `findById`, `update`, `updatePartial`, `delete`.

Important side effect:

- Deleting metadata through `FileService.delete(id)` deletes the physical file at `item.relativePath` using `StoreManager.deleteFilepath`.
- Do not call `FileService.delete` if the desired behavior is to keep the physical file.

## FileServiceFactory Behavior

Always obtain the metadata service through `FileServiceFactory.instance` in application code.

The singleton chooses repository by `CommonConfig.DbEngine`:

- `COMMON.DB_ENGINES.MONGODB`: uses `FileMongoRepository`.
- `COMMON.DB_ENGINES.SQLITE`: uses `FileSqliteRepository` with `CommonConfig.SqliteDbFile` and calls `repository.build()`.
- Any other value throws an error requiring one of the configured Drax DB engines.

## Routes And Controllers

Register both routes when the app needs full media support:

```ts
import {MediaRoutes, FileRoutes} from "@drax/media-back";

server.fastifyRegister(MediaRoutes);
server.fastifyRegister(FileRoutes);
```

`MediaRoutes` expose physical file operations:

- `POST /api/file/:dir`: multipart upload. Requires `MediaPermissions.UploadFile` (`file:upload`).
- `GET /api/file/:dir/:year/:month/:filename`: download. No explicit permission check in `MediaController.downloadFile`.
- `DELETE /api/file/:dir/:year/:month/:filename?deleteMetadata=true`: delete. Requires `MediaPermissions.DeleteFile` (`file:delete`).

`FileRoutes` expose metadata CRUD operations through `FileController`:

- `GET /api/file`, `/api/file/find`, `/api/file/search`, `/api/file/:id`, `/api/file/find-one`, `/api/file/group-by`, `/api/file/export`.
- `POST /api/file`, `PUT /api/file/:id`, `PATCH /api/file/:id`, `DELETE /api/file/:id`.
- The path namespace overlaps with `MediaRoutes`; preserve the route order used by existing Drax apps unless changing Fastify route behavior deliberately.

## Permissions

Use media permissions for physical file endpoints:

- `MediaPermissions.UploadFile = "file:upload"`.
- `MediaPermissions.DeleteFile = "file:delete"`.

Use file permissions for metadata CRUD:

- `file:create`, `file:update`, `file:delete`, `file:view`, `file:viewAll`, `file:updateAll`, `file:deleteAll`, `file:manage`.

`FileController` enables tenant and user scoping:

- `tenantField = "tenant"`, with tenant filter, setter, and assert enabled.
- `userField = "createdBy.id"`, with user filter, setter, and assert enabled.
- `preUpdate` removes `relativePath`, `absolutePath`, and `filename` from payloads, then sets `updatedBy` from `request.rbac`.

When adding metadata update features, do not expose changes to `relativePath`, `absolutePath`, or `filename` through normal update endpoints.

## Metadata Shape

Core metadata fields are:

- required storage fields: `filename`, `relativePath`, `absolutePath`, `url`, `mimetype`, `encoding`, `extension`, `size`, `type`, `lastAccess`, `ttlSeconds`.
- optional classification fields: `description`, `tags`, `createdFor`, `isPublic`.
- ownership fields: `createdBy`, `updatedBy`, `tenant`.
- analytics/lifecycle fields: `hits`, `expiresAt`, `createdAt`, `updatedAt`.

`FileModel` sets `expiresAt` before validation when `ttlSeconds` is present and `expiresAt` is not set. TTL expiration cleanup is not implemented in `FileService`; do not assume files expire automatically unless another module or database index handles it.

## Configuration

Check these configuration values before integrating:

- `CommonConfig.FileDir`: base directory for physical files. Defaults to `files`.
- `CommonConfig.BaseUrl`: base URL used to build public download URLs. Trailing slash is removed.
- `CommonConfig.DbEngine`: controls repository selection in `FileServiceFactory`.
- `CommonConfig.SqliteDbFile`: used when DB engine is SQLite.
- `DRAX_FILE_METADATA`: metadata is enabled by default. Values matching `/true|yes|enable/i` enable it when the variable exists; any other explicit value disables it.

The Fastify server must also be configured to support multipart uploads and `reply.sendFile`, as shown by the existing Drax server/test setup.

## Integration Patterns

For upload workflows in other modules:

1. Accept or receive an `IUploadFile`-compatible object.
2. Pick a safe logical `dir` such as `avatars`, `invoices`, `attachments`, or `emails`.
3. Call `new MediaService().saveFile(...)`.
4. Store `saved.relativePath` or the metadata `_id` in the domain entity, not a hand-built filesystem path.
5. Use `saved.url` for client-facing downloads when the standard `/api/file/...` route is registered.

For download workflows:

1. If using the public URL, let `MediaRoutes` serve `/api/file/:dir/:year/:month/:filename`.
2. If serving from custom endpoints, call `mediaService.getFile(...)` and pass `file.filename` plus `file.fileDir` to `reply.sendFile`.
3. Use `registerHit: false` only for internal/system reads.

For deletion workflows:

1. Prefer `mediaService.deleteFileByRelativePath({relativePath})` when the domain entity stores `relativePath`.
2. Prefer `mediaService.deleteFile({dir, year, month, filename})` when the URL/path parts are already available.
3. Be explicit with `deleteMetadata: false` only when metadata must remain for audit purposes.
4. Remember that deleting a metadata record through `FileServiceFactory.instance.delete(id)` deletes the physical file too.

## Common Pitfalls

- Do not use arbitrary user input as `dir`; map business concepts to allowlisted directory names.
- Do not pass nested directories as `dir`; `MediaService` intentionally rejects them.
- Do not mutate `relativePath`, `absolutePath`, or `filename` through metadata update endpoints.
- Do not assume download is private; `MediaController.downloadFile` does not assert RBAC permissions.
- Do not bypass `FileServiceFactory` unless testing or implementing a repository.
- Do not double-delete: if `FileService.delete(id)` is called, the physical file deletion hook already runs.
- Do not assume metadata exists when `DRAX_FILE_METADATA` is explicitly disabled.

## Tests To Consult Or Extend

Use existing tests as executable examples:

- `packages/media/media-back/test/service/Media-service.test.ts`: service-level save, hit registration, validation, not-found behavior.
- `packages/media/media-back/test/endpoints/Media-endpoints.test.ts`: upload/download endpoint behavior and metadata assertions.
- `packages/media/media-back/test/endpoints/File-endpoints.test.ts`: metadata CRUD endpoint behavior.

When changing behavior, add tests at the service level for file/metadata consistency and at endpoint level for RBAC, route behavior, and multipart handling.
