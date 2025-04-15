import type {IMediaFile} from "./IMediaFile";

interface IMediaProvider {
    uploadFile(file:File, dir: string, timeout?:number): Promise<IMediaFile>
}

export type {IMediaProvider}
