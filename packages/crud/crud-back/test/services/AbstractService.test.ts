import { test } from 'node:test';
import assert from 'node:assert';
import MockRepository from "../_mocks/MockRepository.js";
import {AbstractService} from "../../src/services/AbstractService.js";
import {fileURLToPath} from "url";
import path from "path";

//@ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockRepository = new MockRepository();
const abstractService = new AbstractService(mockRepository);

test('create', async () => {
    const item: any = await abstractService.create({name: 'John Doe'})
    assert.deepStrictEqual(item.name, 'John Doe');
})


test('export', async () => {
    const file = 'test.csv'
    const outputPath = path.resolve(__dirname, file);

    const result:any = await abstractService.export(
        {
            format: 'CSV',
            headers: ['name'],
            separator: ';',
            limit: 0,
            search: '',
            filters: [],
        }
    )

    console.log("result",result)

    assert.deepStrictEqual(outputPath, result.outputPath);
    assert.deepStrictEqual(2, result.rowCount);
})
