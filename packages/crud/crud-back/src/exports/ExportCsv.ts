import * as fs from 'fs';
import AbstractExport from "./AbstractExport.js";
import type {ExportOptions} from "./AbstractExport";


interface ExportCsvOptions extends ExportOptions {
    separator: string
    pretty?: boolean
}

class ExportCsv extends AbstractExport {

    protected separator: string = ';'
    protected pretty: boolean = false

    constructor(options: ExportCsvOptions) {
        super(options)
        this.separator = options.separator ? options.separator : ';';
        this.pretty = options.pretty === true;
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
                        //console.log("csvRow", csvRow);
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

            value = this.pretty ? this.formatValue(value) : this.formatRawValue(value);

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

    protected formatRawValue(value: any): string {
        if (value === undefined || value === null) return '';

        if (Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] === 'object') {
                return JSON.stringify(value);
            }
            return value.join(',');
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return value.toString();
    }

    protected formatValue(value: any): string {
        if (value === undefined || value === null) return '';
        if (this.isObjectId(value)) return value.toHexString();
        if (value instanceof Date) return this.formatDate(value);
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) {
            const items = value.map(item => this.formatValue(item)).join(',');
            return `[${items}]`;
        }
        if (typeof value === 'object') {
            const plainValue = this.toPlainValue(value);
            const items = Object.entries(plainValue).map(([key, item]) => `${key}: ${this.formatValue(item)}`).join(' | ');
            return items;
        }
        return value.toString();
    }

    protected toPlainValue(value: any): any {
        if (value && typeof value.toObject === 'function') {
            return value.toObject({
                depopulate: false,
                flattenMaps: true,
                getters: false,
                virtuals: false,
            });
        }

        return value;
    }

    protected formatDate(value: Date): string {
        if (Number.isNaN(value.getTime())) return '';

        const day = value.getUTCDate().toString().padStart(2, '0');
        const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = value.getUTCFullYear().toString();
        const hours = value.getUTCHours().toString().padStart(2, '0');
        const minutes = value.getUTCMinutes().toString().padStart(2, '0');
        const seconds = value.getUTCSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    protected isObjectId(value: any): boolean {
        return typeof value?.toHexString === 'function' && value.constructor?.name === 'ObjectId';
    }

}

export default ExportCsv;
