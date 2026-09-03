import {spawn} from "node:child_process";
import {createReadStream, createWriteStream} from "node:fs";
import {access, mkdir, rm} from "node:fs/promises";
import {basename, resolve} from "node:path";
import {Writable} from "node:stream";
import {pipeline} from "node:stream/promises";
import {createGunzip} from "node:zlib";

type RecoveryOperationResult = {
    archivePath: string;
    filename: string;
    command: "mongodump" | "mongorestore";
    output: string;
};

class RecoveryService {
    private readonly backupsDirectory = resolve(process.cwd(), "recovery-dumps");

    async dump(masterPassword: string): Promise<RecoveryOperationResult> {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);
        const mongoUri = this.getMongoUri();

        await mkdir(this.backupsDirectory, {recursive: true});

        const filename = `mongo-dump-${this.getTimestamp()}.archive.gz`;
        const archivePath = resolve(this.backupsDirectory, filename);
        const output = await this.runMongoCommand("mongodump", [
            "--uri",
            mongoUri,
            "--archive=" + archivePath,
            "--gzip",
        ]);

        return {
            archivePath,
            filename,
            command: "mongodump",
            output,
        };
    }

    async restore(masterPassword: string, archivePath: string, drop = true): Promise<RecoveryOperationResult> {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);
        const mongoUri = this.getMongoUri();
        const resolvedArchivePath = this.resolveArchivePath(archivePath);
        await access(resolvedArchivePath);
        await this.assertValidGzipArchive(resolvedArchivePath);

        const args = [
            "--uri",
            mongoUri,
            "--archive=" + resolvedArchivePath,
            "--gzip",
        ];

        if (drop) {
            args.push("--drop");
        }

        const output = await this.runMongoCommand("mongorestore", args);

        return {
            archivePath: resolvedArchivePath,
            filename: basename(resolvedArchivePath),
            command: "mongorestore",
            output,
        };
    }

    async saveUploadedArchive(fileStream: NodeJS.ReadableStream, filename: string): Promise<string> {
        this.assertRecoveryEnabled();
        await mkdir(this.backupsDirectory, {recursive: true});

        const safeFilename = basename(filename || "uploaded-mongo-dump.archive.gz");
        const archivePath = resolve(this.backupsDirectory, `uploaded-mongo-dump-${this.getTimestamp()}-${safeFilename}`);

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

    private getMongoUri(): string {
        const mongoUri = process.env.MONGO_URI || process.env.DRAX_MONGO_URI;

        if (!mongoUri) {
            const error = new Error("MONGO_URI o DRAX_MONGO_URI no esta configurada.");
            (error as any).statusCode = 500;
            throw error;
        }

        return mongoUri;
    }

    private resolveArchivePath(archivePath: string): string {
        if (!archivePath) {
            const error = new Error("Debe indicar el archivo de dump a restaurar.");
            (error as any).statusCode = 400;
            throw error;
        }

        const resolvedArchivePath = resolve(archivePath);
        const backupsDirectory = this.backupsDirectory + "/";

        if (!resolvedArchivePath.startsWith(backupsDirectory)) {
            const error = new Error("El archivo de restore debe estar dentro del directorio recovery-dumps.");
            (error as any).statusCode = 400;
            throw error;
        }

        return resolvedArchivePath;
    }

    private getTimestamp(): string {
        return new Date().toISOString().replace(/[:.]/g, "-");
    }

    private async assertValidGzipArchive(archivePath: string): Promise<void> {
        try {
            await pipeline(
                createReadStream(archivePath),
                createGunzip(),
                new Writable({
                    write(_chunk, _encoding, callback) {
                        callback();
                    },
                })
            );
        } catch (error: any) {
            const validationError = new Error(
                `El archivo subido no es un dump .gz valido o esta incompleto. ${error?.message || ""}`.trim()
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

    private runMongoCommand(command: "mongodump" | "mongorestore", args: string[]): Promise<string> {
        return new Promise((resolvePromise, rejectPromise) => {
            const child = spawn(command, args, {shell: false});
            const output: string[] = [];

            child.stdout.on("data", (data) => output.push(data.toString()));
            child.stderr.on("data", (data) => output.push(data.toString()));

            child.on("error", (error: any) => {
                if (error?.code === "ENOENT") {
                    error.message = `${command} no esta instalado o no esta disponible en PATH.`;
                }
                rejectPromise(error);
            });

            child.on("close", (code) => {
                const joinedOutput = output.join("").trim();
                if (code === 0) {
                    resolvePromise(joinedOutput);
                    return;
                }

                const error = new Error(joinedOutput || `${command} finalizo con codigo ${code}.`);
                (error as any).statusCode = 500;
                rejectPromise(error);
            });
        });
    }
}

export default RecoveryService;
export {RecoveryService};
