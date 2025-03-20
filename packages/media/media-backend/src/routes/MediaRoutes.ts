import {join} from "path";
import {MediaPermissions} from "../permissions/MediaPermissions.js";
import {StoreManager, UploadFileError, DraxConfig, CommonConfig, UnauthorizedError} from "@drax/common-back";

const BASE_FILE_DIR = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''

function validateDir(dir: string) {
    let dirRegExp = /^[a-zA-Z0-9_-]+$/
    if (!dir || dirRegExp.test(dir) === false) {
        return false
    }
    return true
}

async function MediaRoutes(fastify, options) {


    fastify.post('/api/file/:dir', {
        schema: {
            tags: ['Media'],
        }
    }, async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(MediaPermissions.UploadFile)

            const dir = request.params.dir
            if (!validateDir(dir)) {
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
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: urlFile,
            }
        } catch (e) {
            console.error(e)
            if (e instanceof UploadFileError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    })


    fastify.get('/api/file/:dir/:year/:month/:filename', {
        schema: {
            tags: ['Media'],
        }
    }, async (request, reply): Promise<any> => {
        try {

            const dir = request.params.dir
            const year = request.params.year
            const month = request.params.month
            const filename = request.params.filename

            console.log("dir: ", dir, " year: ", year, " month: ", month, " filename: ", filename)

            if (validateDir(dir) == false) {
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
            console.log("FILE_DIR: ", fileDir, " FILENAME:", filename)
            return reply.sendFile(filename, fileDir)
        } catch (e) {
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    })


}

export default MediaRoutes;
export {MediaRoutes}
