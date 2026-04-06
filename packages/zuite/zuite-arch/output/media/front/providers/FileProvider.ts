
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IFile, IFileBase} from '../interfaces/IFile'

class FileProvider extends AbstractCrudRestProvider<IFile, IFileBase, IFileBase> {
    
  static singleton: FileProvider
    
  constructor() {
   super('/api/file')
  }
  
  static get instance() {
    if(!FileProvider.singleton){
      FileProvider.singleton = new FileProvider()
    }
    return FileProvider.singleton
  }

}

export default FileProvider

