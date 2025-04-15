import type {IMediaProvider} from "../interfaces/IMediaProvider";
import type {IMediaFile} from "../interfaces/IMediaFile";

class MediaSystem implements IMediaProvider {

    _provider: IMediaProvider
    prototype: string;

    constructor(provider: IMediaProvider) {
        this._provider = provider;
        this.prototype = 'MediaSystem'
    }

    uploadFile(file: File, dir: string, timeout: number = 360000): Promise<IMediaFile> {
        return this._provider.uploadFile(file, dir, timeout);
    }

}

export default MediaSystem
export {MediaSystem}
