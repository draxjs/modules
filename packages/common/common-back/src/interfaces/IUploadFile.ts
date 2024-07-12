import {Readable} from "stream";

interface IUploadFile{
    filename: string
    fileStream: Readable
    mimetype: string
    encoding?: string
    size?: number
}

interface IUploadFileResult{
    filename: string
    path: string
    mimetype?: string
    encoding?: string
    size: number
}

interface IUploadFileOptions{
    extensions?: string[]
    mimetypes?: string[]
    maxSize?: number
}


export type {IUploadFile, IUploadFileResult, IUploadFileOptions}
