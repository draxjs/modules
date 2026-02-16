import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCH_OUTPUT_DIR = path.resolve(__dirname, '../output');
const BACK_MODULES_DIR = path.resolve(__dirname, '../../zuite-back/src/modules');
const FRONT_MODULES_DIR = path.resolve(__dirname, '../../zuite-front/src/modules');

async function copyForce(src: string, dest: string) {
    try {
        const stats = await fs.stat(src);

        if (stats.isDirectory()) {
            await fs.mkdir(dest, { recursive: true });
            const entries = await fs.readdir(src);

            for (const entry of entries) {
                await copyForce(path.join(src, entry), path.join(dest, entry));
            }
        } else {
            await fs.copyFile(src, dest);
            console.log(`[COPY] Overwritten: ${dest}`);
        }
    } catch (err) {
        console.error(`Error processing ${src}:`, err);
    }
}

async function main() {
    try {
        const modules = await fs.readdir(ARCH_OUTPUT_DIR);

        for (const moduleName of modules) {
            const modulePath = path.join(ARCH_OUTPUT_DIR, moduleName);
            const stats = await fs.stat(modulePath);

            if (!stats.isDirectory()) continue;

            console.log(`Processing module: ${moduleName}`);

            // Backend
            const srcBack = path.join(modulePath, 'back');
            const destBack = path.join(BACK_MODULES_DIR, moduleName);

            try {
                await fs.access(srcBack);
                console.log(`  Target Back: ${destBack}`);
                await copyForce(srcBack, destBack);
            } catch {
                console.log(`  No backend files found for ${moduleName}`);
            }

            // Frontend
            const srcFront = path.join(modulePath, 'front');
            const destFront = path.join(FRONT_MODULES_DIR, moduleName);

            try {
                await fs.access(srcFront);
                console.log(`  Target Front: ${destFront}`);
                await copyForce(srcFront, destFront);
            } catch {
                console.log(`  No frontend files found for ${moduleName}`);
            }
        }
    } catch (err) {
        console.error('Error in main execution:', err);
    }
}

main();
