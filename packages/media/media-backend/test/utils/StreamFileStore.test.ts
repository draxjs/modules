import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from "fs";
import type {IUploadFile} from "../../../../common/common-back/src/interfaces/IUploadFile";
import StreamFileStore from "../../../../common/common-back/src/utils/StreamFileStore";
import {join} from "path";
import UploadFileError from "../../../../common/common-back/src/errors/UploadFileError";

const __dirname = new URL(".", import.meta.url).pathname;

async function simulateUploadFile(): Promise<IUploadFile> {
    const path = join(__dirname, '..', 'data', 'test.jpg');
    const file: IUploadFile = {
        filename: 'test.jpg',
        fileStream: fs.createReadStream(path),
        mimetype: 'image/jpeg'
    }

    return file
}


test('StreamFileStore max size exceeded', async () => {

    const file = await simulateUploadFile();
    const path = join(__dirname, '..', 'store', file.filename);


    await assert.rejects(
        async () => {
            await StreamFileStore(file.fileStream, 5000, path)
        },
        (error) => {
            assert(error instanceof UploadFileError, 'Expected error to be instance of UploadFileError');
            return true;
        }
    )

})


test('StreamFileStore stored', async () => {

    const file = await simulateUploadFile();
    const path = join(__dirname, '..', 'store', file.filename);

    await StreamFileStore(file.fileStream, 80000, path)

    assert.equal(true, true)

})
