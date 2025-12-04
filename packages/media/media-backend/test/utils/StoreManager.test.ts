import {test, expect} from 'vitest';
import assert from 'node:assert/strict';
import fs from 'fs';
import type {IUploadFile} from "../../../../common/common-back/src/interfaces/IUploadFile";
import {join} from "path";
import UploadFileError from "../../../../common/common-back/src/errors/UploadFileError";
import StoreManager from "../../../../common/common-back/src/store/StoreManager";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function simulateUploadFileStream(): Promise<IUploadFile> {
    const path = join(__dirname, '..', 'data', 'test.jpg');
    const file: IUploadFile = {
        filename: 'test.jpg',
        fileStream: fs.createReadStream(path),
        mimetype: 'image/jpeg'
    }
    return file
}

async function simulateUploadFile(): Promise<IUploadFile> {
    const path = join(__dirname, '..', 'data', 'test.jpg');
    const file: IUploadFile = {
        filename: 'test.jpg',
        file: fs.createReadStream(path),
        mimetype: 'image/jpeg'
    }
    return file
}


test('StoreManager saveFile max size exceeded', async () => {
    const file = await simulateUploadFile();
    const destinationPath = join(__dirname, '..', 'store');

    await assert.rejects(
        async () => {
            await StoreManager.saveFile(file, destinationPath, {maxSize: 5000})
        },
        (error) => {
            assert(error instanceof UploadFileError, 'Expected error to be instance of UploadFileError');
            return true;
        }
    )
})


test('StoreManager saveFile fileStream', async () => {

    const file = await simulateUploadFileStream();
    const destinationPath = join(__dirname, '..', 'store');
    const fileSaveResult  = await StoreManager.saveFile(file, destinationPath, {maxSize: 80000})
    expect(fileSaveResult.mimetype).toBe(file.mimetype)
    expect(fileSaveResult.filename).toBeTruthy()

})

test('StoreManager saveFile file', async () => {

    const file = await simulateUploadFile();
    const destinationPath = join(__dirname, '..', 'store');
    const fileSaveResult  = await StoreManager.saveFile(file, destinationPath, {maxSize: 80000})
    expect(fileSaveResult.mimetype).toBe(file.mimetype)
    expect(fileSaveResult.filename).toBeTruthy()

})
