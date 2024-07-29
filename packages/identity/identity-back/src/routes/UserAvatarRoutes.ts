import {join} from "path";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import {StoreManager, UploadFileError, DraxConfig, CommonConfig} from "@drax/common-back";
import UserServiceFactory from "../factory/UserServiceFactory.js";
import IdentityConfig from "../config/IdentityConfig.js";

const FILE_DIR = DraxConfig.getOrLoad(IdentityConfig.AvatarDir) || 'avatars';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''


async function UserAvatarRoutes(fastify, options) {


    fastify.post('/api/user/avatar', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertAuthenticated()
            const userId = request.rbac.getAuthUser.id

            const data = await request.file()

            const file = {
                filename: data.filename,
                fileStream: data.file,
                mimetype: data.mimetype
            }

            const destinationPath = join(FILE_DIR)
            const storedFile = await StoreManager.saveFile(file, destinationPath)
            const urlFile = BASE_URL + '/api/user/avatar/' + storedFile.filename

            //Save into DB
            const userService = UserServiceFactory()
            return await userService.changeAvatar(userId, urlFile)

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


    fastify.get('/api/user/avatar/:filename', async (request, reply): Promise<any> => {
        try {
            const filename = request.params.filename
            const [year, month] = filename.split('-')
            const fileDir = join(FILE_DIR, year, month)
            //console.log("FILE_DIR: ",fileDir, " FILENAME:", filename)
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

export default UserAvatarRoutes;
export {UserAvatarRoutes}
