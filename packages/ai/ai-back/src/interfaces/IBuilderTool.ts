import type {IDraxCrudService} from "@drax/crud-share";
import type {ZodObject, ZodRawShape} from "zod";

type ToolBuilderMethod =
    | "create"
    | "update"
    | "updatePartial"
    | "delete"
    | "findById"
    | "findByIds"
    | "findOneBy"
    | "findOne"
    | "findBy"
    | "fetchAll"
    | "search"
    | "find"
    | "paginate"
    | "groupBy";

type ToolBuilderService<T = any, C = any, U = any> = IDraxCrudService<T, C, U> & Record<string, any>;

interface ToolBuilderOptions<T = any, C = any, U = any> {
    entityName: string;
    entityDescription?: string;
    navigationBasePath?: string;
    schema: ZodObject<ZodRawShape>;
    outputSchema?: ZodObject<ZodRawShape>;
    service: ToolBuilderService<T, C, U>;
    methods: ToolBuilderMethod[];
    toolNamePrefix?: string;
}

interface ToolBuilderLike {
    inputSchema: ZodObject<ZodRawShape>;
    partialInputSchema: ZodObject<ZodRawShape>;
    objectParameters(schema: ZodObject<ZodRawShape>): object;
}

interface ToolDefinition<T = any, C = any, U = any> {
    description: (entityName: string) => string;
    parameters: (builder: ToolBuilderLike) => object;
    execute: (service: ToolBuilderService<T, C, U>, args: any) => any | Promise<any>;
}

export type {
    ToolBuilderLike,
    ToolBuilderMethod,
    ToolBuilderOptions,
    ToolBuilderService,
    ToolDefinition,
};
