import type {IDraxCrud, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";

class MockRepository implements IDraxCrud<any, any, any> {
    async create(data: any): Promise<any> {
        return {id: '1',...data}
    }

    async update(id: string, data: any): Promise<any> {
        return {...data}
    }

    async delete(id: string): Promise<boolean> {
        return true
    }

    async findById(id: string): Promise<any | null> {
        return {id: '1', name: 'John Doe'}
    }

    async findByIds(ids: string[]): Promise<any[]> {
        return [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
    }

    async findOneBy(field: string, value: string): Promise<any | null> {
        return {id: '1', name: 'John Doe'}
    }

    async findBy(field: string, value: string): Promise<any[]> {
        return [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
    }

    async fetchAll(): Promise<any[]> {
        return [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
    }

    async search(value: string): Promise<any[]> {
        return [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
    }

    async find(options?: any): Promise<any[]> {
        return [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
    }

    paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<any>> {

        return Promise.resolve({
            page: 1,
            limit: 10,
            total: 2,
            items: [{id: '1', name: 'John Doe'}, {id: '2', name: 'Jane Doe'}]
        })
    }


}

export {MockRepository}
export default MockRepository
