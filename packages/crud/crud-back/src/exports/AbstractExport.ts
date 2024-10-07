import {createDirIfNotExist} from "@drax/common-back";
import crypto from "crypto";


interface ExportOptions {
    cursor: any
    destinationPath: string
    headers: string[] | string
}

export type {ExportOptions}

class AbstractExport {

    cursor: any
    destinationPath: string
    headers: string[]

    fileName: string
    relativeFilePath: string

    constructor(options: ExportOptions) {
        this.cursor = options.cursor;
        this.destinationPath = options.destinationPath;
        this.headers = Array.isArray(options.headers) ? options.headers : options.headers.split(',');
    }


    createDirIfNotExist(): void {
        createDirIfNotExist(this.destinationPath);
    }

    generateFileName(extension:string): string {
        if (!this.fileName) {
            const randomUUID = crypto.randomUUID().toString();
            this.fileName = `export_${randomUUID}.${extension}`;
        }
        return this.fileName;

    }

    generateFilePath(extension:string) {
        this.createDirIfNotExist();
        this.generateFileName(extension);
        this.relativeFilePath = `${this.destinationPath}/${this.fileName}`;
        return this.relativeFilePath;
    }


    isIterableAsync(value: any) {
        return value != null && typeof value[Symbol.asyncIterator] === 'function';
    }

    isIterableSync(value: any) {
        return value != null && typeof value[Symbol.iterator] === 'function';
    }

    getNestedProperty(obj: object, path: string) {
        return path.split('.').reduce((acc, part) => {
            if (Array.isArray(acc)) {
                return acc.map(item => item[part]).join('|');
            }
            return acc && acc[part];
        }, obj);
    }

}


export {
    AbstractExport,
}

export default AbstractExport;
