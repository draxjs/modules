import fs from 'fs/promises';
import {getTextExtractor} from 'office-text-extractor'
import {JSDOM} from 'jsdom';

class KnowledgeService {


    async getFromTxt(filePath: string): Promise<string> {
        const content = await fs.readFile(filePath, 'utf-8');
        return this.sanitizeText(content);
    }

    async getFromPdf(path: string, type: 'url'|'file' = 'url'): Promise<string> {
        const extractor = getTextExtractor()
        const text = await extractor.extractText({input: path, type: type});
        return this.sanitizeText(text);
    }

    async getFromUrl(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const dom = new JSDOM(html);
        const content = dom.window.document.body.textContent || '';
        return this.sanitizeText(content);
    }


      sanitizeText(text: string): string {
        // Normalización
        text = text.toLowerCase();

        // Limpieza ligera (solo espacios largos)
        text = text.replace(/\s+/g, " ").trim();

        return text
    }


    chunkTextBySentence(text: string, chunkSize: number = 512): string[] {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks: string[] = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            const potentialChunk = currentChunk + ' ' + sentence;
            if (potentialChunk.length > chunkSize && currentChunk !== '') {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk = potentialChunk;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

export default KnowledgeService;
export {KnowledgeService}
