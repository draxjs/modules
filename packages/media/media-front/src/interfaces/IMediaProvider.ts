import type {IMediaFile} from "./IMediaFile";

interface IMediaProvider {
    uploadFile(file:File, dir: string): Promise<IMediaFile>
}

export type {IMediaProvider}
