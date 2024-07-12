import { Readable } from 'stream';
import { pipeline } from 'stream/promises'
import {StreamSizeValidator} from './StreamSizeValidator.js';
import fs from "fs";

async function StreamFileStore(fileStream: Readable, maxSize:number = 5, destination: string): Promise<{bytesWritten: number}>  {

    try{
        const writable = fs.createWriteStream(destination)
        const transform = new StreamSizeValidator(maxSize)
        await pipeline(fileStream, transform, writable)
        return {
            bytesWritten: writable.bytesWritten
        }
    }catch (e){
        console.error(e)
        throw e
    }


}

export {StreamFileStore}
export default StreamFileStore
