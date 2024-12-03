import * as fs from "node:fs/promises";

export async function createDir(dirPath:string) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directorio ${dirPath} creado correctamente.`);
    } catch (error) {
        console.error('Error al crear el directorio:', error);
        throw error;
    }
}
