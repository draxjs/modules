import type {IDraxCrudProvider} from "@drax/crud-share";
import type {IFile, IFileBase} from "@drax/media-share";

interface IFileProvider extends IDraxCrudProvider<IFile, IFileBase, IFileBase> {
}

export type {IFileProvider}
