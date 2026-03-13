import FileSystemFactory from "../factory/FileSystemFactory.js";
import type {IFileProvider} from "../interfaces/IFileProvider";

class FileProvider {

  static get instance(): IFileProvider {
    return FileSystemFactory.getInstance()
  }

}

export default FileProvider
export {FileProvider}
