interface IQueryFilter{
    field: string;
    operator: string;
    value: any;
    orGroup?: string;
}

export type {IQueryFilter}
