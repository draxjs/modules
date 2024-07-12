import {join} from "path";
import {UnauthorizedError} from "@drax/identity-back";
import {MediaPermissions} from "../permissions/MediaPermissions.js";
import {StoreManager, UploadFileError} from "@drax/common-back";

const FILE_DIR = process.env.DRAX_FILE_DIR || 'uploads';
const BASE_URL = process.env.DRAX_BASE_URL.replace(/\/$/, '') || ''

async function MediaRoutes(fastify, options) {


    fastify.post('/api/file', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(MediaPermissions.UploadFile)
            const data = await request.file()
            const file = {
                filename: data.filename,
                fileStream: data.file,
                mimetype: data.mimetype
            }

            const destinationPath = join(FILE_DIR)
            const storedFile = await StoreManager.saveFile(file, destinationPath)
            const urlFile = BASE_URL + '/api/file/' + storedFile.filename
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


    fastify.get('/api/file/:filename', async (request, reply): Promise<any> => {
        try {
            const filename = request.params.filename
            const [year, month] = filename.split('-')
            const fileDir = join(FILE_DIR, year, month)
            console.log("FILE_DIR: ",fileDir, " FILENAME:", filename)
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
