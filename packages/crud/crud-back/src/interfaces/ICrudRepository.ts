import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";

interface ICrudRepository<T,C,U>{
    paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>>
    create(input: C): Promise<T>
    update(id: string, input: U): Promise<T>
    delete(id: string): Promise<any>

    findById?(id: string): Promise<T | null>
    findByIds?(ids: Array<string>): Promise<T[]>
    findOneBy?(field: string, value: any): Promise<T | null>
    findBy?(field: string, value: any): Promise<T[]>
    fetchAll?(): Promise<T[]>
    search?(value: any, limit ?: number): Promise<T[]>
}
export type { ICrudRepository }
