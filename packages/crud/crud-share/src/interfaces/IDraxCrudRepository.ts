
import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxFindOptions} from "./IDraxFindOptions";
import {Cursor} from "mongoose";

interface IDraxCrudRepository<T,C,U> extends IDraxCrud<T, C, U>  {
  findCursor?(options: IDraxFindOptions): Promise<Cursor<T>>
  build?(): void
}

export type {IDraxCrudRepository}
