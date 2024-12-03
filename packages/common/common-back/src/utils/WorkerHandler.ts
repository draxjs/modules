import { Worker } from 'worker_threads';
import path from 'path';

const WorkerHandler = (workerFile: string, params: any) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(workerFile));

        worker.postMessage(params);

        worker.on('message', (message) => {
                resolve(message)
        });

        worker.on('error', (e) => reject(e));
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker finalizó con código: ${code}`));
            }
        });
    });
}

export default WorkerHandler;
export { WorkerHandler }
