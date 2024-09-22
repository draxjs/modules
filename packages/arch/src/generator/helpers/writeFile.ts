import * as fs from "node:fs/promises";
import {createDir} from "./createDir";

export async function writeFile(dirPath:string, fileName:string, content:string) {
    try {
        await createDir(dirPath)
        const filePath = `${dirPath}/${fileName}`;
        await fs.writeFile(filePath, content, { encoding: 'utf-8' });
        console.log(`Archivo ${filePath} escrito correctamente.`);
    } catch (error) {
        console.error('Error al escribir el archivo:', error);
        throw error;
    }
}
