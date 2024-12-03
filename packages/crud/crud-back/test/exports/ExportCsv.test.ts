import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import ExportCsv from '../../src/exports/ExportCsv';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
    if (fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath);
    }
}

const mockData = [
    {
        id: '123',
        name: 'Cristian',
        lastname: 'Incarnato',
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
        destinationPath: outputFilePath,
        headers: ['name', 'lastname', 'address','phones', 'hobbies'],
        separator: ';',
    });

    await exportCsv.process();

    const output = readGeneratedCSV(outputFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;address;phones;hobbies');
    assert.strictEqual(output[1], 'Cristian;Incarnato;{"street":"Directorio","number":"3935","floor":"6","depto":"c"};[{"number":"1234567","type":"personal"},{"number":"87456123","type":"laboral"}];soccer,gym');

    //cleanUp(outputFilePath);
})

test('Debe exportar atributos de objeto a un archivo CSV', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_object_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const exportCsv = new ExportCsv({
        cursor: mockCursor,
        destinationPath: outputFilePath,
        headers: ['name', 'lastname', 'address.street','address.number'],
        separator: ';',
    });

    await exportCsv.process();

    const output = readGeneratedCSV(outputFilePath);

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
        destinationPath: outputFilePath,
        headers: ['name', 'lastname', 'phones.number','phones.type'],
        separator: ';',
    });

    await exportCsv.process();

    const output = readGeneratedCSV(outputFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;phones.number;phones.type');
    assert.strictEqual(output[1], 'Cristian;Incarnato;1234567|87456123;personal|laboral');

    //cleanUp(outputFilePath);
})
