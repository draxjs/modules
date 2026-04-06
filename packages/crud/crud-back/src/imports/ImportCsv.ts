import AbstractImport, {ImportOptions, ParsedImportRow} from "./AbstractImport.js";

interface ParsedCsvImport<T = any> {
    headers: string[]
    rows: ParsedImportRow<T>[]
}

class ImportCsv extends AbstractImport {

    constructor(options: ImportOptions) {
        super(options);
    }

    process(): any[] {
        return this.processDetailed().rows.map(row => row.item);
    }

    processDetailed(): ParsedCsvImport {
        const rows = this.parseRows(this.content);
        if (rows.length === 0) {
            return {headers: [], rows: []};
        }

        const [headers, ...dataRows] = rows;

        return {
            headers,
            rows: dataRows
            .filter(row => row.some(value => value.trim() !== ''))
            .map((row): ParsedImportRow => {
                const item: Record<string, any> = {};

                headers.forEach((header, index) => {
                    const normalizedHeader = header.trim();
                    if (!normalizedHeader) {
                        return;
                    }

                    this.assignNestedValue(item, normalizedHeader, this.parseValue(row[index] ?? ''));
                });

                return {
                    rawValues: row,
                    item
                };
            })
        };
    }

    protected parseRows(content: string): string[][] {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentValue = '';
        let inQuotes = false;

        for (let index = 0; index < content.length; index++) {
            const char = content[index];
            const nextChar = content[index + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentValue += '"';
                    index++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (char === this.separator && !inQuotes) {
                currentRow.push(currentValue);
                currentValue = '';
                continue;
            }

            if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    index++;
                }

                currentRow.push(currentValue);
                if (currentRow.some(value => value !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentValue = '';
                continue;
            }

            currentValue += char;
        }

        currentRow.push(currentValue);
        if (currentRow.some(value => value !== '')) {
            rows.push(currentRow);
        }

        return rows;
    }
}

export default ImportCsv;
