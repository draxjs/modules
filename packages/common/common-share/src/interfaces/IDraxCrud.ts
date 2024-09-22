import type {IDraxPaginateResult} from "./IDraxPaginateResult";
import type {IDraxPaginateOptions} from "./IDraxPaginateOptions";

interface IDraxCrud<T,C,U>{
  paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>>
  create(input: C): Promise<T>
  update(id: string, input: U): Promise<T>
  delete(id: string): Promise<any>

  findById?(id: string): Promise<T | null>
  findByIds?(id: string): Promise<T[]>
  findOneBy?(field: string, value: any): Promise<T | null>
  findBy?(field: string, value: any): Promise<T[]>
  fetchAll?(): Promise<T[]>
  search?(value: any): Promise<T[]>
}

export type {IDraxCrud}
