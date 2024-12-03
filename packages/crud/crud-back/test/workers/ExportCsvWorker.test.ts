
// Reemplazo de __dirname para ES modules
import {test} from "node:test";
import path from "path";
import assert from "node:assert";
import {WorkerHandler} from "@drax/common-back"
import {fileURLToPath} from "url";
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

test('Debe exportar atributos base a un archivo CSV', async () => {
    const outputFilePath = path.resolve(__dirname, 'output_base_worker_test.csv');

    cleanUp(outputFilePath);

    const mockCursor = createMockCursor(mockData);
    const workerFile = './src/workers/ExportCsvWorker.js'
    const params = {
        cursor: mockCursor,
        outputPath: outputFilePath,
        headers: ['name', 'lastname', 'address','phones', 'hobbies'],
        separator: ';',
    }

    try{
        const result = await WorkerHandler(workerFile,params)
        console.log("result", result)
    }catch (error) {
        console.log("error", error)
    }


    const output = readGeneratedCSV(outputFilePath);

    // Verificar que el archivo CSV tenga las filas correctas para los arrays
    assert.strictEqual(output[0], 'name;lastname;address;phones;hobbies');
    assert.strictEqual(output[1], 'Cristian;Incarnato;{"street":"Directorio","number":"3935","floor":"6","depto":"c"};[{"number":"1234567","type":"personal"},{"number":"87456123","type":"laboral"}];soccer,gym');

    //cleanUp(outputFilePath);
})
