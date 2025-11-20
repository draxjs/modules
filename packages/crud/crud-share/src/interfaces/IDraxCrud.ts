import type {IDraxPaginateResult} from "./IDraxPaginateResult";
import type {IDraxPaginateOptions} from "./IDraxPaginateOptions";
import type {IDraxFindOptions} from "./IDraxFindOptions";
import type {IDraxFieldFilter} from "./IDraxFieldFilter";
import type {IDraxFindOneOptions} from "./IDraxFindOneOptions";
import {IDraxGroupByOptions} from "./IDraxGroupByOptions";

interface IDraxCrud<T,C,U>{
  paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>>
  create(input: C): Promise<T>
  update(id: string, input: U): Promise<T>
  delete(id: string): Promise<any>

  updatePartial?(id: string, input: any): Promise<T>

  findById?(id: string): Promise<T | null>
  findByIds?(ids: Array<string>): Promise<T[]>
  fetchAll?(): Promise<T[]>
  search?(value: any, limit: number, filters: IDraxFieldFilter[]): Promise<T[]>
  find?(options: IDraxFindOptions): Promise<T[]>
  findOne?(options: IDraxFindOneOptions): Promise<T>

  findBy?(field: string, value: any, limit: number): Promise<T[]>
  findOneBy?(field: string, value: any): Promise<T | null>

  groupBy?(options: IDraxGroupByOptions): Promise<Array<any>>

}

export type {IDraxCrud}
