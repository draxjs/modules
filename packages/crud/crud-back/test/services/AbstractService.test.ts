import { test, assert } from 'vitest';
import MockRepository from "../_mocks/MockRepository.js";
import {AbstractService} from "../../src/services/AbstractService.js";

const mockRepository = new MockRepository();

class MockService extends AbstractService<any,any,any>{

}

const service = new MockService(mockRepository);

test('create', async () => {
    const item: any = await service.create({name: 'John Doe'})
    assert.deepStrictEqual(item.name, 'John Doe');
})

test('import json', async () => {
    const result: any = await service.import({
        format: 'JSON',
        content: JSON.stringify([
            {name: 'John Doe'},
            {name: 'Jane Doe'}
        ])
    })

    assert.deepStrictEqual(result.rowCount, 2);
})

test('import csv', async () => {
    const result: any = await service.import({
        format: 'CSV',
        separator: ';',
        content: '_id;name;profile.age\n1;John Doe;32\n2;Jane Doe;28'
    })

    assert.deepStrictEqual(result.rowCount, 2);
})

test('export', async () => {
    const result:any = await service.export(
        {
            format: 'CSV',
            headers: ['name'],
            separator: ';',
            limit: 0,
            search: '',
            filters: [],
        },"/tmp"
    )

    console.log("result",result)

    assert.deepStrictEqual(2, result.rowCount);
})
