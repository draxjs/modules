import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import ExportCsv from '../../src/exports/ExportCsv.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Simulación de un cursor para MongoDB o SQLite
function createMockCursor(data: any[]) {
    let index = 0;
    return {
        async *[Symbol.asyncIterator]() {
            while (index < data.length) {
                yield data[index++];
            }
        },
    };
}

//@ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Utilidad para leer el contenido del CSV generado
function readGeneratedCSV(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.length > 0);
}

// Eliminar el archivo de salida después de cada prueba
function cleanUp(outputFilePath) {
    if (fs.existsSync(outputFilePath) && fs.statSync(outputFilePath).isFile()) {
        fs.unlinkSync(outputFilePath);
    }
}

const mockData = [
    {
        _id: new mongoose.Types.ObjectId('6a58de7047289095fbbffe24'),
        id: '123',
        name: 'Cristian',
        lastname: 'Incarnato',
        createdAt: new Date('2026-07-16T13:36:48.772Z'),
        updatedAt: '2026-07-16T13:36:48.772Z',
        age: 39,
        address: {
            street: 'Directorio',
            number: '3935',
            floor: '6',
            depto: 'c'
        },
        phones: [
            { number: '1234567', type: 'personal' },
            { number: '87456123', type: 'laboral' },
        ],
        hobbies: ['soccer', 'gym'],
        pets: [
            {name: 'capitan', colors: ['grey'], skills: [{name: 'jump', level: 2}] },
            {name: 'indio', colors: ['grey', 'white'], skills: [{name: 'jump', level: 5}, {name: 'run', level: 4}]},
        ],
        jobs: ['developer','devops']
    },
];


// Prueba para exportar datos con arrays de subdocumentos
test('Debe exportar atributos base a un archivo CSV', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_base_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['name', 'lastname', 'address','phones', 'hobbies'],
        separator: ';',
        pretty: false,
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;address;phones;hobbies');
    assert.strictEqual(output[1], 'Cristian;Incarnato;"{""street"":""Directorio"",""number"":""3935"",""floor"":""6"",""depto"":""c""}";"[{""number"":""1234567"",""type"":""personal""},{""number"":""87456123"",""type"":""laboral""}]";soccer,gym');

    //cleanUp(outputFilePath);
})

test('Debe exportar atributos de objeto a un archivo CSV', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_object_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['name', 'lastname', 'address.street','address.number'],
        separator: ';',
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;address.street;address.number');
    assert.strictEqual(output[1], 'Cristian;Incarnato;Directorio;3935');

    //cleanUp(outputFilePath);
})



test('Debe exportar atributos de un array de objetos a un archivo CSV', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_object_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['name', 'lastname', 'phones.number','phones.type'],
        separator: ';',
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;phones.number;phones.type');
    assert.strictEqual(output[1], 'Cristian;Incarnato;1234567|87456123;personal|laboral');

    //cleanUp(outputFilePath);
})

test('Debe exportar ObjectId y fechas como texto legible en UTC', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_object_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['_id', 'createdAt', 'updatedAt'],
        separator: ';',
        pretty: true,
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    assert.strictEqual(output[0], '_id;createdAt;updatedAt');
    assert.strictEqual(output[1], '6a58de7047289095fbbffe24;16/07/2026 13:36:48;2026-07-16T13:36:48.772Z');
})

test('Debe mantener estructuras anidadas sin serializarlas como JSON', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_object_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['hobbies', 'pets'],
        separator: ';',
        pretty: true,
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    assert.strictEqual(output[0], 'hobbies;pets');
    assert.strictEqual(output[1], '[soccer,gym];[name: capitan | colors: [grey] | skills: [name: jump | level: 2],name: indio | colors: [grey,white] | skills: [name: jump | level: 5,name: run | level: 4]]');
})

test('Debe exportar documentos Mongoose hidratados en formato pretty sin recorrer metadata interna', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_mongoose_document_test.csv');

    cleanUp(outputFilePath);

    const modelName = 'ExportCsvPersonTest';
    const PersonModel = mongoose.models[modelName] || mongoose.model(modelName, new mongoose.Schema({
        fullname: String,
        address: {
            city: String,
            street: String,
        },
        skills: [{
            name: String,
            level: Number,
        }],
    }));

    const person = new PersonModel({
        fullname: 'Cristian',
        address: {
            city: 'Buenos Aires',
            street: 'Directorio',
        },
        skills: [
            {name: 'dev', level: 5},
            {name: 'ops', level: 4},
        ],
    });

    const mockCursor = createMockCursor([person]);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: __dirname,
        headers: ['fullname', 'address', 'skills'],
        separator: ';',
        pretty: true,
    });

    const result = await exportCsv.process();

    const output = readGeneratedCSV(result.relativeFilePath);

    assert.strictEqual(output[0], 'fullname;address;skills');
    assert.match(output[1], /^Cristian;city: Buenos Aires \| street: Directorio;\[name: dev \| level: 5 \| _id: [a-f0-9]{24},name: ops \| level: 4 \| _id: [a-f0-9]{24}\]$/);
})
