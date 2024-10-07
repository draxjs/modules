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

            try{
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
                    for await (const record of this.cursor) {
                        const csvRow = JSON.stringify(record);
                        console.log("csvRow", csvRow);
                        writableStream.write(csvRow + ',\n');
                        rowCount++
                    }
                } else if (this.isIterableSync(this.cursor)) {
                    for (const record of this.cursor) {
                        const csvRow = JSON.stringify(record);
                        writableStream.write(csvRow + ',\n');
                        rowCount++
                    }
                }
                writableStream.write(']');
                writableStream.end();
            }catch (e){
                reject(e);
            }

        })
    }

}

export default ExportJson;
