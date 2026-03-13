import type {IMediaFile} from "@drax/media-share";

interface IMediaProvider {
    uploadFile(file:File, dir: string, timeout?:number): Promise<IMediaFile>
}

export type {IMediaProvider}
