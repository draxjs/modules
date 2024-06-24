
interface IPaginateClient<t> {
    page: number;
    limit: number;
    total: number;
    items: t[];
}

export type {IPaginateClient}
