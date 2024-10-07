import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import type {IUploadFile} from "../../../../common/common-back/src/interfaces/IUploadFile";
import {join} from "path";
import UploadFileError from "../../../../common/common-back/src/errors/UploadFileError";
import StoreManager from "../../../../common/common-back/src/store/StoreManager";
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function simulateUploadFile(): Promise<IUploadFile> {
    const path = join(__dirname, '..', 'data', 'test.jpg');
    const file: IUploadFile = {
        filename: 'test.jpg',
        fileStream: fs.createReadStream(path),
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


test('StoreManager saveFile', async () => {

    const file = await simulateUploadFile();
    const destinationPath = join(__dirname, '..', 'store');
    await StoreManager.saveFile(file, destinationPath, {maxSize: 80000})

    //assert.equal(statSync(path).size, file.buffer.length, 'File size')

})
