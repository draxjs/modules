import {
    CommonController,
    StoreManager,
    UnauthorizedError,
    UploadFileError,
    DraxConfig,
    CommonConfig,
} from "@drax/common-back";
import {join} from "path";
import {MediaPermissions} from "../permissions/MediaPermissions.js";

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
            return {
                filename: storedFile.filename,
                filepath: storedFile.path,
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: urlFile,
            }
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
            return reply.sendFile(filename, fileDir)
        } catch (e) {
            this.handleError(e, reply)
        }

    }


}

export default MediaController
export {MediaController}
