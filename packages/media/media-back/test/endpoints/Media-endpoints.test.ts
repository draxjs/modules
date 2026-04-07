import { describe, it, beforeAll, afterAll, expect } from "vitest";
// @ts-ignore
import FormData from "form-data";
import { readFileSync } from "node:fs";
import { access, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import MediaRoutes from "../../src/routes/MediaRoutes.js";
import MediaPermissions from "../../src/permissions/MediaPermissions.js";
import FilePermissions from "../../src/permissions/FilePermissions.js";
import { FileServiceFactory } from "../../src/factory/services/FileServiceFactory.js";
import TestSetup from "../setup/TestSetup.js";

// @ts-ignore
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturePath = join(__dirname, "..", "data", "test.jpg");
const storePath = join(process.cwd(), "packages/media/media-back/test/store");

describe("Media Endpoints Test", function () {
    const testSetup = new TestSetup({
        routes: [MediaRoutes],
        permissions: [MediaPermissions, FilePermissions],
    });

    beforeAll(async () => {
        await testSetup.setup();
    });

    afterAll(async () => {
        await rm(storePath, {recursive: true, force: true});
        await testSetup.dropAndClose();
    });

    async function uploadFile(accessToken: string, dir: string = "inbox") {
        const form = new FormData();
        form.append("file", readFileSync(fixturePath), {
            filename: "test.jpg",
            contentType: "image/jpeg",
        });

        return await testSetup.fastifyInstance.inject({
            method: "POST",
            url: `/api/file/${dir}`,
            payload: form.getBuffer(),
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    it("should upload a file and register metadata", async () => {
        const {accessToken} = await testSetup.rootUserLogin();
        await testSetup.dropCollection("File");

        const resp = await uploadFile(accessToken, "emails");
        const body = await resp.json();

        expect(resp.statusCode).toBe(200);
        expect(body.filename).toMatch(/test\.jpg$/);
        expect(body.filepath).toContain("packages/media/media-back/test/store/emails/");
        expect(body.url).toContain("/api/file/emails/");

        const metadata = await FileServiceFactory.instance.findOneBy("relativePath", body.filepath);
        expect(metadata).toBeTruthy();
        expect(metadata?.filename).toBe(body.filename);

        await access(join(process.cwd(), body.filepath));
    });

    it("should download a file and register a hit", async () => {
        const {accessToken} = await testSetup.rootUserLogin();
        await testSetup.dropCollection("File");

        const uploadResp = await uploadFile(accessToken, "download-test");
        const uploaded = await uploadResp.json();
        const metadataBefore = await FileServiceFactory.instance.findOneBy("relativePath", uploaded.filepath);

        const url = new URL(uploaded.url);
        const downloadResp = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: url.pathname,
        });

        expect(downloadResp.statusCode).toBe(200);
        expect(downloadResp.headers["content-type"]).toContain("image/jpeg");
        expect(downloadResp.body.length).toBeGreaterThan(0);

        const metadataAfter = await FileServiceFactory.instance.findOneBy("relativePath", uploaded.filepath);
        expect((metadataAfter?.hits || 0)).toBe((metadataBefore?.hits || 0) + 1);
    });

    it("should reject upload for invalid directory", async () => {
        const {accessToken} = await testSetup.rootUserLogin();

        const resp = await uploadFile(accessToken, "invalid.dir");
        const body = await resp.json();

        expect(resp.statusCode).toBe(400);
        expect(body.message).toBe("Invalid directory name");
    });

    it("should return 404 when downloading a missing file", async () => {
        const resp = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/file/emails/2024/03/missing.jpg",
        });

        const body = await resp.json();
        expect(resp.statusCode).toBe(404);
        expect(body.message).toBe("File not found");
    });

    it("should reject download for invalid month", async () => {
        const resp = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/file/emails/2024/3/test.jpg",
        });

        const body = await resp.json();
        expect(resp.statusCode).toBe(400);
        expect(body.message).toBe("Invalid month");
    });
});
