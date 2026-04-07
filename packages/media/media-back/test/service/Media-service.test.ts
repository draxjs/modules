import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { createReadStream } from "node:fs";
import { access, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BadRequestError, NotFoundError } from "@drax/common-back";
import MediaService from "../../src/services/MediaService.js";
import { FileServiceFactory } from "../../src/factory/services/FileServiceFactory.js";
import TestSetup from "../setup/TestSetup.js";

// @ts-ignore
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturePath = join(__dirname, "..", "data", "test.jpg");
const storePath = join(process.cwd(), "packages/media/media-back/test/store");

describe("Media Service Test", function () {
    const mediaService = new MediaService();
    const testSetup = new TestSetup();

    beforeAll(async () => {
        await testSetup.setup();
    });

    afterAll(async () => {
        await rm(storePath, {recursive: true, force: true});
        await testSetup.dropAndClose();
    });

    it("should save a file and register metadata", async () => {
        await testSetup.dropCollection("File");

        const saved = await mediaService.saveFile({
            dir: "emails",
            file: {
                filename: "test.jpg",
                fileStream: createReadStream(fixturePath),
                mimetype: "image/jpeg",
            },
            createdBy: {
                id: "507f1f77bcf86cd799439011",
                username: "email-provider",
            },
            date: new Date("2024-03-15T10:00:00.000Z"),
        });

        expect(saved.filename).toMatch(/test\.jpg$/);
        expect(saved.relativePath).toBe(`packages/media/media-back/test/store/emails/2024/03/${saved.filename}`);
        expect(saved.url).toBe(`http://localhost/api/file/emails/2024/03/${saved.filename}`);

        await access(saved.absolutePath);

        const metadata = await FileServiceFactory.instance.findOneBy("relativePath", saved.relativePath);
        expect(metadata).toBeTruthy();
        expect(metadata?.createdBy?.username).toBe("email-provider");
    });

    it("should get a file and increment metadata hits", async () => {
        await testSetup.dropCollection("File");

        const saved = await mediaService.saveFile({
            dir: "attachments",
            file: {
                filename: "test.jpg",
                fileStream: createReadStream(fixturePath),
                mimetype: "image/jpeg",
            },
            createdBy: {
                id: "507f1f77bcf86cd799439011",
                username: "email-provider",
            },
            date: new Date("2024-04-20T10:00:00.000Z"),
        });

        const before = await FileServiceFactory.instance.findOneBy("relativePath", saved.relativePath);
        const file = await mediaService.getFile({
            dir: "attachments",
            year: "2024",
            month: "04",
            filename: saved.filename,
        });

        expect(file.relativePath).toBe(saved.relativePath);
        expect(file.absolutePath).toBe(saved.absolutePath);

        const after = await FileServiceFactory.instance.findOneBy("relativePath", saved.relativePath);
        expect((after?.hits || 0)).toBe((before?.hits || 0) + 1);
    });

    it("should reject invalid directory names", async () => {
        await expect(
            mediaService.saveFile({
                dir: "../emails",
                file: {
                    filename: "test.jpg",
                    fileStream: createReadStream(fixturePath),
                    mimetype: "image/jpeg",
                },
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should throw not found when the file does not exist", async () => {
        await expect(
            mediaService.getFile({
                dir: "emails",
                year: "2024",
                month: "03",
                filename: "missing.jpg",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
