import * as fs from 'fs';
import AbstractExport from "./AbstractExport.js";
import type {ExportOptions} from "./AbstractExport";


interface ExportCsvOptions extends ExportOptions {
    separator: string
}

class ExportCsv extends AbstractExport {

    protected separator: string = ';'

    constructor(options: ExportCsvOptions) {
        super(options)
        this.separator = options.separator ? options.separator : ';';
    }

    // Método principal para procesar los datos y generar el CSV
    process(): Promise<any> {
        return new Promise(async (resolve, reject) => {

            try {

                this.generateFilePath('csv')
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

                let csvHeaders = this.headers.join(this.separator);
                if(this.headersTranslate && this.headersTranslate.length) csvHeaders = this.headersTranslate.join(this.separator)

                writableStream.write(csvHeaders + '\n');

                if (this.isIterableAsync(this.cursor)) {
                    for await (const record of this.cursor) {
                        const csvRow = this.convertRecordToCSVrow(record);
                        console.log("csvRow", csvRow);
                        writableStream.write(csvRow + '\n');
                        rowCount++
                    }
                } else if (this.isIterableSync(this.cursor)) {
                    // Si es un cursor de SQLite (better-sqlite3), usamos iterate()
                    for (const record of this.cursor) {
                        const csvRow = this.convertRecordToCSVrow(record);
                        writableStream.write(csvRow + '\n');
                        rowCount++
                    }
                }
                writableStream.end();
            } catch (e) {
                reject(e);
            }

        })
    }


    // Método que convierte un registro en una o más filas de CSV
    convertRecordToCSVrow(record: object): string {
        let fields = []

        for (const header of this.headers) {

            let value
            if (header.includes('.')) {
                value = this.getNestedProperty(record, header);
            } else {
                value = record[header];
            }

            if (value === undefined || value === null) {
                fields.push('');
                continue;
            }

            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    value = JSON.stringify(value);
                } else {
                    value = value.join(',');
                }
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            } else {
                value = value.toString();
            }

            if (
                value.includes(this.separator) ||
                value.includes('"') ||
                value.includes('\n') ||
                value.includes('\r')
            ) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }

            fields.push(value);
        }
        return fields.join(this.separator);
    }

}

export default ExportCsv;