import * as fs from "node:fs/promises";

export async function readFileContent(filePath){
    try {
        const fileContent = await fs.readFile(filePath,{encoding: 'utf-8'  });
        return fileContent;
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        throw error;
    }
}
