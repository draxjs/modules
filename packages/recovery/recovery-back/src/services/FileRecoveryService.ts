import {spawn} from "node:child_process";
import {createWriteStream} from "node:fs";
import {access, mkdir, rm} from "node:fs/promises";
import {basename, dirname, resolve} from "node:path";
import {pipeline} from "node:stream/promises";

type FileRecoveryOperationResult = {
    archivePath: string;
    filename: string;
    sourceDirectory: string;
    command: "tar";
    output: string;
};

class FileRecoveryService {
    private readonly backupsDirectory = resolve(process.cwd(), "recovery-file-backups");

    async backup(masterPassword: string): Promise<FileRecoveryOperationResult> {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);

        const fileDirectory = this.getFileDirectory();
        await access(fileDirectory);
        await mkdir(this.backupsDirectory, {recursive: true});

        const filename = `file-backup-${this.getTimestamp()}.tar.gz`;
        const archivePath = resolve(this.backupsDirectory, filename);
        const output = await this.runTarCommand([
            "-czf",
            archivePath,
            "-C",
            dirname(fileDirectory),
            basename(fileDirectory),
        ]);

        return {
            archivePath,
            filename,
            sourceDirectory: fileDirectory,
            command: "tar",
            output,
        };
    }

    async saveUploadedArchive(fileStream: NodeJS.ReadableStream, filename: string): Promise<string> {
        this.assertRecoveryEnabled();
        await mkdir(this.backupsDirectory, {recursive: true});

        const safeFilename = basename(filename || "uploaded-file-backup.tar.gz");
        const archivePath = resolve(this.backupsDirectory, `uploaded-file-backup-${this.getTimestamp()}-${safeFilename}`);

        try {
            await pipeline(fileStream, createWriteStream(archivePath));
        } catch (error: any) {
            await rm(archivePath, {force: true});

            if ((fileStream as any).truncated || error?.code === "FST_REQ_FILE_TOO_LARGE") {
                this.throwUploadTooLargeError();
            }

            throw error;
        }

        if ((fileStream as any).truncated) {
            await rm(archivePath, {force: true});
            this.throwUploadTooLargeError();
        }

        return archivePath;
    }

    async resolveDownloadPath(archivePath: string): Promise<string> {
        this.assertRecoveryEnabled();
        const resolvedArchivePath = this.resolveArchivePath(archivePath);
        await access(resolvedArchivePath);

        return resolvedArchivePath;
    }

    async restore(masterPassword: string, archivePath: string, cleanTarget = false): Promise<FileRecoveryOperationResult> {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);

        const fileDirectory = this.getFileDirectory();
        const resolvedArchivePath = this.resolveArchivePath(archivePath);
        await access(resolvedArchivePath);
        await this.assertValidTarArchive(resolvedArchivePath);
        await mkdir(dirname(fileDirectory), {recursive: true});

        if (cleanTarget) {
            await rm(fileDirectory, {recursive: true, force: true});
        }

        const output = await this.runTarCommand([
            "-xzf",
            resolvedArchivePath,
            "-C",
            dirname(fileDirectory),
        ]);

        return {
            archivePath: resolvedArchivePath,
            filename: basename(resolvedArchivePath),
            sourceDirectory: fileDirectory,
            command: "tar",
            output,
        };
    }

    private assertRecoveryEnabled() {
        const enabled = ["true", "1", "yes", "on"].includes((process.env.RECOVERY_ENABLED || "").toLowerCase());

        if (!enabled) {
            const error = new Error("Recovery esta deshabilitado. Configure RECOVERY_ENABLED=true para habilitarlo.");
            (error as any).statusCode = 403;
            throw error;
        }
    }

    private assertMasterPassword(masterPassword?: string) {
        const configuredPassword = process.env.RECOVERY_MASTER_PASSWORD;

        if (!configuredPassword) {
            const error = new Error("RECOVERY_MASTER_PASSWORD no esta configurada.");
            (error as any).statusCode = 500;
            throw error;
        }

        if (!masterPassword || masterPassword !== configuredPassword) {
            const error = new Error("Password maestra invalida.");
            (error as any).statusCode = 403;
            throw error;
        }
    }

    private getFileDirectory(): string {
        if (!process.env.DRAX_FILE_DIR) {
            const error = new Error("DRAX_FILE_DIR no esta configurada.");
            (error as any).statusCode = 500;
            throw error;
        }

        return resolve(process.env.DRAX_FILE_DIR);
    }

    private resolveArchivePath(archivePath: string): string {
        if (!archivePath) {
            const error = new Error("Debe indicar el archivo de backup a restaurar.");
            (error as any).statusCode = 400;
            throw error;
        }

        const resolvedArchivePath = resolve(archivePath);
        const backupsDirectory = this.backupsDirectory + "/";

        if (!resolvedArchivePath.startsWith(backupsDirectory)) {
            const error = new Error("El archivo de restore debe estar dentro del directorio recovery-file-backups.");
            (error as any).statusCode = 400;
            throw error;
        }

        return resolvedArchivePath;
    }

    private getTimestamp(): string {
        return new Date().toISOString().replace(/[:.]/g, "-");
    }

    private async assertValidTarArchive(archivePath: string): Promise<void> {
        try {
            await this.runTarCommand(["-tzf", archivePath], false);
        } catch (error: any) {
            const validationError = new Error(
                `El archivo subido no es un backup .tar.gz valido o esta incompleto. ${error?.message || ""}`.trim()
            );
            (validationError as any).statusCode = 400;
            throw validationError;
        }
    }

    private throwUploadTooLargeError(): never {
        const maxUploadMb = Math.round(this.getMaxUploadBytes() / 1024 / 1024);
        const error = new Error(`El archivo subido supera el limite de ${maxUploadMb} MB.`);
        (error as any).statusCode = 413;
        throw error;
    }

    private getMaxUploadBytes(): number {
        const configuredLimit = Number(process.env.RECOVERY_MAX_UPLOAD_BYTES);

        if (Number.isFinite(configuredLimit) && configuredLimit > 0) {
            return configuredLimit;
        }

        return 1024 * 1024 * 1024;
    }

    private runTarCommand(args: string[], collectStdout = true): Promise<string> {
        return new Promise((resolvePromise, rejectPromise) => {
            const child = spawn("tar", args, {shell: false});
            const output: string[] = [];

            child.stdout.on("data", (data) => {
                if (collectStdout) {
                    output.push(data.toString());
                }
            });
            child.stderr.on("data", (data) => output.push(data.toString()));

            child.on("error", (error: any) => {
                if (error?.code === "ENOENT") {
                    error.message = "tar no esta instalado o no esta disponible en PATH.";
                }
                rejectPromise(error);
            });

            child.on("close", (code) => {
                const joinedOutput = output.join("").trim();
                if (code === 0) {
                    resolvePromise(joinedOutput);
                    return;
                }

                const error = new Error(joinedOutput || `tar finalizo con codigo ${code}.`);
                (error as any).statusCode = 500;
                rejectPromise(error);
            });
        });
    }
}

export default FileRecoveryService;
export {FileRecoveryService};
