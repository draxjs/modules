import {
    BadRequestError,
    CommonConfig,
    DraxConfig,
    NotFoundError,
    StoreManager,
} from "@drax/common-back";
import type {IUploadFile, IUploadFileResult} from "@drax/common-back";
import {join, resolve} from "node:path";
import {access} from "node:fs/promises";
import {FileServiceFactory} from "../factory/services/FileServiceFactory.js";

interface IMediaCreatedBy {
    id: string;
    username: string;
}

interface IMediaSaveFileParams {
    dir: string;
    file: IUploadFile;
    createdBy?: IMediaCreatedBy;
    date?: Date;
}

interface IMediaSaveFileResult extends IUploadFileResult {
    fileDir: string;
    relativePath: string;
    absolutePath: string;
    extension: string;
    type: string;
    url: string;
}

interface IMediaGetFileParams {
    dir: string;
    year: string;
    month: string;
    filename: string;
    registerHit?: boolean;
}

interface IMediaGetFileResult {
    dir: string;
    year: string;
    month: string;
    filename: string;
    fileDir: string;
    relativePath: string;
    absolutePath: string;
}

class MediaService {
    protected getBaseFileDir(): string {
        return DraxConfig.getOrLoad(CommonConfig.FileDir) || "files";
    }

    protected getBaseUrl(): string {
        return DraxConfig.getOrLoad(CommonConfig.BaseUrl)
            ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, "")
            : "";
    }

    validateDir(dir: string): boolean {
        const dirRegExp = /^[a-zA-Z0-9_-]+$/;
        return !!dir && dirRegExp.test(dir);
    }

    validateYear(year: string): boolean {
        return /^[0-9]{4}$/.test(year);
    }

    validateMonth(month: string): boolean {
        return /^[0-9]{2}$/.test(month);
    }

    protected assertDir(dir: string): void {
        if (!this.validateDir(dir)) {
            throw new BadRequestError("Invalid directory name");
        }
    }

    protected assertYear(year: string): void {
        if (!this.validateYear(year)) {
            throw new BadRequestError("Invalid year");
        }
    }

    protected assertMonth(month: string): void {
        if (!this.validateMonth(month)) {
            throw new BadRequestError("Invalid month");
        }
    }

    protected isMetadataEnabled(): boolean {
        return process.env.DRAX_FILE_METADATA
            ? /true|yes|enable/i.test(process.env.DRAX_FILE_METADATA)
            : true;
    }

    protected buildDatePathParts(date: Date): {year: string; month: string} {
        return {
            year: date.getFullYear().toString(),
            month: (date.getMonth() + 1).toString().padStart(2, "0"),
        };
    }

    async saveFile(params: IMediaSaveFileParams): Promise<IMediaSaveFileResult> {
        const {dir, file, createdBy, date = new Date()} = params;

        this.assertDir(dir);

        const {year, month} = this.buildDatePathParts(date);
        const fileDir = join(this.getBaseFileDir(), dir, year, month);
        const storedFile = await StoreManager.saveFile(file, fileDir);
        const relativePath = storedFile.path;
        const absolutePath = resolve(process.cwd(), relativePath);
        const extension = StoreManager.getExtension(storedFile.filename);
        const url = `${this.getBaseUrl()}/api/file/${dir}/${year}/${month}/${storedFile.filename}`;
        const type = storedFile.mimetype?.split("/")[0] || "";

        if (this.isMetadataEnabled()) {
            try {
                await FileServiceFactory.instance.registerUploadedFile({
                    filename: storedFile.filename,
                    relativePath,
                    absolutePath,
                    size: storedFile.size,
                    mimetype: storedFile.mimetype || file.mimetype,
                    encoding: storedFile.encoding || file.encoding || "",
                    extension,
                    type,
                    lastAccess: new Date(),
                    ttlSeconds: 0,
                    hits: 0,
                    url,
                    createdBy,
                });
            } catch (e) {
                await StoreManager.deleteFile(fileDir, storedFile.filename).catch(() => undefined);
                throw e;
            }
        }

        return {
            ...storedFile,
            fileDir,
            relativePath,
            absolutePath,
            extension,
            type,
            url,
        };
    }

    async getFile(params: IMediaGetFileParams): Promise<IMediaGetFileResult> {
        const {dir, year, month, filename, registerHit = true} = params;

        this.assertDir(dir);
        this.assertYear(year);
        this.assertMonth(month);

        const fileDir = join(this.getBaseFileDir(), dir, year, month);
        const relativePath = join(fileDir, filename);
        const absolutePath = resolve(process.cwd(), relativePath);

        try {
            await access(absolutePath);
        } catch {
            throw new NotFoundError("File not found");
        }

        if (registerHit && this.isMetadataEnabled()) {
            await FileServiceFactory.instance.registerDownloadHit(relativePath);
        }

        return {
            dir,
            year,
            month,
            filename,
            fileDir,
            relativePath,
            absolutePath,
        };
    }
}

export default MediaService;
export {
    MediaService,
};
export type {
    IMediaCreatedBy,
    IMediaSaveFileParams,
    IMediaSaveFileResult,
    IMediaGetFileParams,
    IMediaGetFileResult,
};
