import {createDirIfNotExist} from "@drax/common-back";
import crypto from "crypto";


interface ExportOptions {
    cursor: any
    destinationPath: string
    headers: string[] | string
    headersTranslate?: string[] | string
    fileName: string
}

export type {ExportOptions}

class AbstractExport {

    protected cursor: any
    protected destinationPath: string
    protected headers: string[]
    protected headersTranslate?: string[]

    protected fileName: string
    protected relativeFilePath: string

    constructor(options: ExportOptions) {
        this.cursor = options.cursor;
        this.destinationPath = options.destinationPath;
        this.headers = Array.isArray(options.headers) ? options.headers : options.headers.split(',');
        this.fileName = options.fileName;
        if(options.headersTranslate){
            this.headersTranslate = Array.isArray(options.headersTranslate) ? options.headersTranslate : options.headersTranslate.split(',');
        }
    }


    createDirIfNotExist(): void {
        createDirIfNotExist(this.destinationPath);
    }

    generateFileName(extension:string): string {
        if (!this.fileName) this.fileName = 'export'
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, '');
        const shortUUID = crypto.randomUUID().slice(0, 4).toUpperCase();
        this.fileName = `${this.fileName}_${formattedDate}_${shortUUID}.${extension}`;
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
