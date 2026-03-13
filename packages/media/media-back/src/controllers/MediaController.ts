import {
    CommonController,
    StoreManager,
    DraxConfig,
    CommonConfig,
} from "@drax/common-back";
import {join} from "path";
import {MediaPermissions} from "../permissions/MediaPermissions.js";
import {FileServiceFactory} from "../factory/services/FileServiceFactory.js";
import path from 'node:path';
const BASE_FILE_DIR = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''

class MediaController extends CommonController {

    constructor() {
        super()
    }

    validateDir(dir: string) {
        let dirRegExp = /^[a-zA-Z0-9_-]+$/
        if (!dir || dirRegExp.test(dir) === false) {
            return false
        }
        return true
    }

    async uploadFile(request: any, reply: any) {
        try {
            request.rbac.assertPermission(MediaPermissions.UploadFile)

            const createdBy = {
                id: request.rbac.userId,
                username: request.rbac.username,
            }

            const dir = request.params.dir
            if (!this.validateDir(dir)) {
                reply.statusCode = 400
                reply.send({error: 'Invalid directory name'})
                return
            }

            const data = await request.file()
            const file = {
                filename: data.filename,
                fileStream: data.file,
                mimetype: data.mimetype
            }

            const year = (new Date().getFullYear()).toString()
            const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
            const destinationPath = join(BASE_FILE_DIR, dir, year, month)

            const storedFile = await StoreManager.saveFile(file, destinationPath)
            const urlFile = `${BASE_URL}/api/file/${dir}/${year}/${month}/${storedFile.filename}`
            const relativePath = storedFile.path
            const absolutePath = path.resolve(process.cwd(), relativePath);
            const extension = StoreManager.getExtension(storedFile.filename)
            const fileService = FileServiceFactory.instance


            const FILE_METADATA = process.env.DRAX_FILE_METADATA ? (/true|yes|enable/i).test(process.env.DRAX_FILE_METADATA) : true
            if (FILE_METADATA === true) {
                try {
                    await fileService.registerUploadedFile({
                        filename: storedFile.filename,
                        relativePath: relativePath,
                        absolutePath: absolutePath,
                        size: storedFile.size,
                        mimetype: storedFile.mimetype || data.mimetype,
                        encoding: storedFile.encoding || data.encoding || '',
                        extension,
                        type: storedFile.mimetype?.split('/')[0] || '',
                        lastAccess: new Date(),
                        ttlSeconds: 0,
                        hits: 0,
                        url: urlFile,
                        createdBy,
                    })
                } catch (e) {
                    await StoreManager.deleteFile(destinationPath, storedFile.filename).catch(() => undefined)
                    throw e
                }
            }

            let theFile = {
                filename: storedFile.filename,
                filepath: storedFile.path,
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: urlFile,
            }

            return theFile
        } catch (e) {
            this.handleError(e, reply)
        }

    }

    async downloadFile(request, reply) {
        try {

            const dir = request.params.dir
            const year = request.params.year
            const month = request.params.month
            const filename = request.params.filename

            //console.log("dir: ", dir, " year: ", year, " month: ", month, " filename: ", filename)

            if (this.validateDir(dir) == false) {
                reply.statusCode = 400
                reply.send({error: 'Invalid directory name'})
                return
            }

            if (/[0-9]{4}/.test(year) == false) {
                reply.statusCode = 400
                reply.send({error: 'Invalid year'})
                return
            }

            if (/[0-9]{2}/.test(month) == false) {
                reply.statusCode = 400
                reply.send({error: 'Invalid month'})
                return
            }

            const fileDir = join(BASE_FILE_DIR, dir, year, month)
            //console.log("FILE_DIR: ", fileDir, " FILENAME:", filename)

            //Agregar hit al archivo
            const FILE_METADATA = process.env.DRAX_FILE_METADATA ? (/true|yes|enable/i).test(process.env.DRAX_FILE_METADATA) : true
            if (FILE_METADATA === true) {
                const fileService = FileServiceFactory.instance
                await fileService.registerDownloadHit(join(fileDir, filename))
            }

            return reply.sendFile(filename, fileDir)
        } catch (e) {
            this.handleError(e, reply)
        }

    }


}

export default MediaController
export {MediaController}
