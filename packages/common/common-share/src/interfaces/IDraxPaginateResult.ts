
interface IDraxPaginateResult<t> {
    page: number;
    limit: number;
    total: number;
    items: t[];
}

export type {IDraxPaginateResult}
