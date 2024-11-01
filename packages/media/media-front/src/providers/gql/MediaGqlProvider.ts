import type {IGqlClient} from '@drax/common-front'
import type {IMediaProvider} from "../../interfaces/IMediaProvider.ts";
import type {IMediaFile} from "../../interfaces/IMediaFile";

class MediaGqlProvider implements IMediaProvider {

    gqlClient: IGqlClient

    constructor(gqlClient: IGqlClient) {
        this.gqlClient = gqlClient
    }


    async uploadFile(file: File, dir: string): Promise<IMediaFile> {
        //const query: string = `mutation changeAvatar( $file: File!) { changeAvatar }`
        const operations = `{ "query": "mutation ($file: File!, dir: String) { uploadFile(file: $file, dir: $dir) }", "variables": { "file": null, "dir": null } }`
        const data = new FormData()
        data.append("operations", operations)
        const map = `{"0": ["variables.file"], "1": ["variables.dir"]}`
        data.append("map", map)
        data.append("0", file)
        data.append("1", dir)
        let r = await this.gqlClient.upload(data)
        return r.data.uploadFile
    }
}

export default MediaGqlProvider
export {MediaGqlProvider}
