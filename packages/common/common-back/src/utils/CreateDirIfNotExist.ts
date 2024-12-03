import * as fs from "node:fs";

function createDirIfNotExist(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}


export {createDirIfNotExist}
export default createDirIfNotExist
