import AbstractImport, {ImportOptions} from "./AbstractImport.js";

class ImportJson extends AbstractImport {

    constructor(options: ImportOptions) {
        super(options);
    }

    process(): any[] {
        const parsedContent = JSON.parse(this.content);

        if (!Array.isArray(parsedContent)) {
            throw new Error('Invalid JSON import format. Expected an array of objects');
        }

        return parsedContent;
    }
}

export default ImportJson;
