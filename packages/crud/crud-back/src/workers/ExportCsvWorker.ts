import { parentPort } from 'worker_threads';
import ExportCsv from '../exports/ExportCsv'; // Ajusta la ruta según sea necesario

parentPort.on('message', async (options) => {
    const exporter = new ExportCsv(options);
    try {
        let result = await exporter.process();
        parentPort.postMessage({result: result});
    } catch (error) {
        parentPort.postMessage({error: error.message});
    }
});
