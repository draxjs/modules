import * as fs from 'fs';
import AbstractExport from "./AbstractExport.js";
import type {ExportOptions} from "./AbstractExport";




class ExportJson extends AbstractExport {

    constructor(options: ExportOptions) {
        super(options)
    }

    // Método principal para procesar los datos y generar el CSV
    process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                this.generateFilePath('json')
                let rowCount = 0
                const start = Date.now();

                const writableStream = fs.createWriteStream(this.relativeFilePath);

                writableStream.on('error', reject);
                writableStream.on('finish', () => resolve({
                    status: 'success',
                    destinationPath: this.destinationPath,
                    fileName: this.fileName,
                    filePath: this.destinationPath + '/' + this.fileName,
                    relativeFilePath: this.relativeFilePath,
                    rowCount: rowCount,
                    time: Date.now() - start,
                    message: 'Export successful',
                }))

                writableStream.write('[');

                if (this.isIterableAsync(this.cursor)) {
                    let isFirstRecord = true;
                    for await (const record of this.cursor) {
                        if (!isFirstRecord) {
                            writableStream.write(',\n');
                        }
                        const jsonRow = JSON.stringify(record);
                        writableStream.write(jsonRow);
                        rowCount++;
                        isFirstRecord = false;
                    }
                } else if (this.isIterableSync(this.cursor)) {
                    let isFirstRecord = true;
                    for (const record of this.cursor) {
                        if (!isFirstRecord) {
                            writableStream.write(',\n');
                        }
                        const jsonRow = JSON.stringify(record);
                        writableStream.write(jsonRow);
                        rowCount++;
                        isFirstRecord = false;
                    }
                }

                writableStream.write('\n]');
                writableStream.end();

            } catch (e) {
                reject(e);
            }
        })
    }

}

export default ExportJson;
