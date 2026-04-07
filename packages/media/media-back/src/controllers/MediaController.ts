import {
    CommonController,
} from "@drax/common-back";
import {MediaPermissions} from "../permissions/MediaPermissions.js";
import {MediaService} from "../services/MediaService.js";

class MediaController extends CommonController {
    protected mediaService: MediaService;

    constructor() {
        super()
        this.mediaService = new MediaService()
    }

    async uploadFile(request: any, reply: any) {
        try {
            request.rbac.assertPermission(MediaPermissions.UploadFile)

            const createdBy = {
                id: request.rbac.userId,
                username: request.rbac.username,
            }

            const dir = request.params.dir
            const data = await request.file()
            const storedFile = await this.mediaService.saveFile({
                dir,
                file: {
                    filename: data.filename,
                    fileStream: data.file,
                    mimetype: data.mimetype,
                    encoding: data.encoding,
                },
                createdBy,
            })

            let theFile = {
                filename: storedFile.filename,
                filepath: storedFile.relativePath,
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: storedFile.url,
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
            const file = await this.mediaService.getFile({dir, year, month, filename})
            return reply.sendFile(file.filename, file.fileDir)
        } catch (e) {
            this.handleError(e, reply)
        }

    }


}

export default MediaController
export {MediaController}
