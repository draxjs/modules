
import type {IFile, IFileBase} from './IFile'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IFileRepository extends IDraxCrudRepository<IFile, IFileBase, IFileBase>{

}

export {IFileRepository}


