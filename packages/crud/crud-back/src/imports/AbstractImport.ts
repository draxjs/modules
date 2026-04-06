import {setNestedValue} from "@drax/common-back";

interface ImportOptions {
    content: string
    separator?: string
}

interface ParsedImportRow<T = any> {
    rawValues: string[]
    item: T
}

class AbstractImport {

    protected content: string
    protected separator: string

    constructor(options: ImportOptions) {
        this.content = options.content;
        this.separator = options.separator || ';';
    }

    parseValue(value: string): any {
        const trimmedValue = value.trim();

        if (trimmedValue === '') {
            return '';
        }

        if (trimmedValue === 'null') {
            return null;
        }

        if (trimmedValue === 'true') {
            return true;
        }

        if (trimmedValue === 'false') {
            return false;
        }

        if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
            return Number(trimmedValue);
        }

        if (
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
            (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))
        ) {
            try {
                return JSON.parse(trimmedValue);
            } catch {
                return value;
            }
        }

        return value;
    }

    assignNestedValue(record: Record<string, any>, key: string, value: any) {
        if (key.includes('.')) {
            setNestedValue(record, key, value);
            return;
        }

        record[key] = value;
    }
}

export type {ImportOptions}
export type {ParsedImportRow}
export {AbstractImport}
export default AbstractImport;
