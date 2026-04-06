import * as fs from 'fs';
import AbstractExport from "../exports/AbstractExport.js";

interface ImportCsvReportRow {
    rawValues: string[]
    status: 'success' | 'error'
    error?: string
}

interface ImportCsvReportOptions {
    destinationPath: string
    fileName?: string
    headers: string[]
    separator?: string
    rows: ImportCsvReportRow[]
}

class ImportCsvReport extends AbstractExport {

    protected separator: string
    protected rows: ImportCsvReportRow[]

    constructor(options: ImportCsvReportOptions) {
        super({
            cursor: [],
            destinationPath: options.destinationPath,
            headers: options.headers,
            fileName: options.fileName || 'import_report',
        });
        this.separator = options.separator || ';';
        this.rows = options.rows;
    }

    process(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.generateFilePath('csv')
                const start = Date.now();
                const writableStream = fs.createWriteStream(this.relativeFilePath);

                writableStream.on('error', reject);
                writableStream.on('finish', () => resolve({
                    status: 'success',
                    destinationPath: this.destinationPath,
                    fileName: this.fileName,
                    filePath: this.destinationPath + '/' + this.fileName,
                    relativeFilePath: this.relativeFilePath,
                    rowCount: this.rows.length,
                    time: Date.now() - start,
                    message: 'Import report generated',
                }))

                writableStream.write([...this.headers, 'import_status', 'error'].join(this.separator) + '\n');

                for (const row of this.rows) {
                    const values = [...row.rawValues, row.status, row.error || ''].map(value => this.escapeCsvValue(value));
                    writableStream.write(values.join(this.separator) + '\n');
                }

                writableStream.end();
            } catch (e) {
                reject(e);
            }
        })
    }

    protected escapeCsvValue(value: any): string {
        let formattedValue = value === null || value === undefined ? '' : String(value);

        if (
            formattedValue.includes(this.separator) ||
            formattedValue.includes('"') ||
            formattedValue.includes('\n') ||
            formattedValue.includes('\r')
        ) {
            formattedValue = '"' + formattedValue.replace(/"/g, '""') + '"';
        }

        return formattedValue;
    }
}

export default ImportCsvReport;
