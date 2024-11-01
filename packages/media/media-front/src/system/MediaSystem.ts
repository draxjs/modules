import type {IMediaProvider} from "../interfaces/IMediaProvider";
import type {IMediaFile} from "../interfaces/IMediaFile";

class MediaSystem implements IMediaProvider {

    _provider: IMediaProvider
    prototype: string;

    constructor(provider: IMediaProvider) {
        this._provider = provider;
        this.prototype = 'MediaSystem'
    }

    uploadFile(file: File, dir: string): Promise<IMediaFile> {
        return this._provider.uploadFile(file, dir);
    }

}

export default MediaSystem
export {MediaSystem}
