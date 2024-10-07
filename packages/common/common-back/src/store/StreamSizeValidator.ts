import {Transform} from "stream";
import {UploadFileError} from "../errors/UploadFileError.js";

class StreamSizeValidator extends Transform {
    private maxSize: number;
    private totalLength: number;
    constructor(maxSize:number = 1) {
        super()
        this.maxSize = maxSize
        this.totalLength = 0
    }

    _transform(chunk, encoding, callback) {
        this.totalLength += chunk.length
        console.log(`totalLength: ${this.totalLength }  /  ${this.maxSize}  (max size)`)

        if (this.totalLength > this.maxSize) {
            this.destroy(new UploadFileError('validation.max_size_exceeded'))
        }

        this.push(chunk)
        callback()
    }
}

export {StreamSizeValidator}
export default StreamSizeValidator
