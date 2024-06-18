
interface IPaginateClient {
    page: number;
    limit: number;
    total: number;
    items: any[];
}

export type {IPaginateClient}
