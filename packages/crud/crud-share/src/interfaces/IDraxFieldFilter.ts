
interface IDraxFieldFilter {
    field: string;
    operator: string;
    value: any;
    orGroup?: string;
}

export {IDraxFieldFilter}
