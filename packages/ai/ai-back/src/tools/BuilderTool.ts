import {z, type ZodObject, type ZodRawShape, type ZodTypeAny} from "zod";
import type {IPromptTool} from "../interfaces/IAIProvider.js";
import type {
    ToolBuilderMethod,
    ToolBuilderOptions,
    ToolBuilderService,
    ToolDefinition
} from "../interfaces/IBuilderTool.js";

const emptyParameters = {
    type: "object",
    properties: {},
    additionalProperties: false,
};

const idSchema = z.object({
    id: z.string().describe("Entity identifier"),
});

const filtersSchema = z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    orGroup: z.string().optional(),
})).optional().describe("Optional Drax field filters");

const toolDefinitions: Record<ToolBuilderMethod, ToolDefinition> = {
    create: {
        description: entityName => `Crear un registro de ${entityName}`,
        parameters: builder => builder.objectParameters(z.object({
            data: builder.inputSchema.describe("Data for the entity to create"),
        })),
        execute: (service, args) => service.create?.(args.data),
    },
    update: {
        description: entityName => `Reemplazar un registro de ${entityName} por id`,
        parameters: builder => builder.objectParameters(z.object({
            id: z.string().describe("Entity identifier"),
            data: builder.inputSchema.describe("Complete replacement data"),
        })),
        execute: (service, args) => service.update?.(args.id, args.data),
    },
    updatePartial: {
        description: entityName => `Actualizar parcialmente un registro de ${entityName} por id`,
        parameters: builder => builder.objectParameters(z.object({
            id: z.string().describe("Entity identifier"),
            data: builder.partialInputSchema.describe("Partial data to update"),
        })),
        execute: (service, args) => service.updatePartial?.(args.id, args.data),
    },
    delete: {
        description: entityName => `Eliminar un registro de ${entityName} por id`,
        parameters: builder => builder.objectParameters(idSchema),
        execute: (service, args) => service.delete?.(args.id),
    },
    findById: {
        description: entityName => `Buscar un registro de ${entityName} por id`,
        parameters: builder => builder.objectParameters(idSchema),
        execute: (service, args) => service.findById?.(args.id),
    },
    findByIds: {
        description: entityName => `Buscar multiples registros de ${entityName} por ids`,
        parameters: builder => builder.objectParameters(z.object({
            ids: z.array(z.string()).describe("Entity identifiers"),
        })),
        execute: (service, args) => service.findByIds?.(args.ids),
    },
    findOneBy: {
        description: entityName => `Buscar un registro de ${entityName} por valor de campo`,
        parameters: builder => builder.objectParameters(z.object({
            field: z.string(),
            value: z.any(),
            filters: filtersSchema,
        })),
        execute: (service, args) => service.findOneBy?.(args.field, args.value, args.filters ?? []),
    },
    findOne: {
        description: entityName => `Buscar el primer registro de ${entityName} que coincida con busqueda y filtros`,
        parameters: builder => builder.objectParameters(z.object({
            search: z.string().optional(),
            filters: filtersSchema,
        })),
        execute: (service, args) => service.findOne?.({
            search: args.search ?? "",
            filters: args.filters ?? [],
        }),
    },
    findBy: {
        description: entityName => `Buscar registros de ${entityName} por valor de campo`,
        parameters: builder => builder.objectParameters(z.object({
            field: z.string(),
            value: z.any(),
            limit: z.number().optional(),
            filters: filtersSchema,
        })),
        execute: (service, args) => service.findBy?.(args.field, args.value, args.limit ?? 1000, args.filters ?? []),
    },
    fetchAll: {
        description: entityName => `Obtener todos los registros de ${entityName}`,
        parameters: () => emptyParameters,
        execute: service => service.fetchAll?.(),
    },
    search: {
        description: entityName => `Buscar registros de ${entityName} por texto`,
        parameters: builder => builder.objectParameters(z.object({
            value: z.string().describe("Search text"),
            limit: z.number().optional(),
            filters: filtersSchema,
        })),
        execute: (service, args) => service.search?.(args.value, args.limit ?? 1000, args.filters ?? []),
    },
    find: {
        description: entityName => `Buscar registros de ${entityName} usando opciones de listado`,
        parameters: builder => builder.objectParameters(z.object({
            orderBy: z.string().optional(),
            order: z.union([z.enum(["asc", "desc"]), z.boolean()]).optional(),
            search: z.string().optional(),
            filters: filtersSchema,
            limit: z.number().optional(),
        })),
        execute: (service, args) => service.find?.({
            orderBy: args.orderBy ?? "",
            order: args.order ?? false,
            search: args.search ?? "",
            filters: args.filters ?? [],
            limit: args.limit ?? 0,
        }),
    },
    paginate: {
        description: entityName => `Paginar registros de ${entityName}`,
        parameters: builder => builder.objectParameters(z.object({
            page: z.number().optional(),
            limit: z.number().optional(),
            orderBy: z.string().optional(),
            order: z.enum(["asc", "desc"]).optional(),
            search: z.string().optional(),
            filters: filtersSchema,
        })),
        execute: (service, args) => service.paginate({
            page: args.page ?? 1,
            limit: args.limit ?? 10,
            orderBy: args.orderBy,
            order: args.order ?? "asc",
            search: args.search ?? "",
            filters: args.filters ?? [],
        }),
    },
    groupBy: {
        description: entityName => `Agrupar registros de ${entityName} por campos`,
        parameters: builder => builder.objectParameters(z.object({
            fields: z.array(z.string()).optional(),
            filters: filtersSchema,
            dateFormat: z.enum(["year", "month", "day", "hour", "minute", "second"]).optional(),
        })),
        execute: (service, args) => service.groupBy?.({
            fields: args.fields ?? [],
            filters: args.filters ?? [],
            dateFormat: args.dateFormat ?? "day",
        }),
    },
};

class BuilderTool<T = any, C = any, U = any> {
    protected _inputSchema: ZodObject<ZodRawShape>;
    protected _partialInputSchema: ZodObject<ZodRawShape>;
    protected _outputSchema?: ZodObject<ZodRawShape>;

    constructor(protected options: ToolBuilderOptions<T, C, U>) {
        this._inputSchema = this.schemaAdapter(options.schema);
        this._partialInputSchema = this._inputSchema.partial();
        this._outputSchema = options.outputSchema ? this.schemaAdapter(options.outputSchema) : undefined;
    }

    get inputSchema() {
        return this._inputSchema;
    }

    get partialInputSchema() {
        return this._partialInputSchema;
    }

    get outputSchema() {
        return this._outputSchema;
    }

    getTools(): IPromptTool[] {
        return this.options.methods.map(method => this.buildTool(method));
    }

    getSystemPromptSection(): string {
        const entityDescription = this.options.entityDescription
            ? `\n${this.options.entityDescription}`
            : "";

        const tools = this.options.methods
            .map(method => {
                const definition = toolDefinitions[method];
                return `- ${this.getToolName(method)}: ${definition.description(this.options.entityName)}`;
            })
            .join("\n");

        const entitySchema = JSON.stringify(this.toJsonSchema(this._outputSchema ?? this._inputSchema));

        return [
            `[ENTIDAD: ${this.options.entityName}]${entityDescription}`,
            `Schema JSON de la entidad: ${entitySchema}`,
            "Tools disponibles:",
            tools,
        ].join("\n");
    }

    objectParameters(schema: ZodObject<ZodRawShape>) {
        return this.toJsonSchema(this.schemaAdapter(schema));
    }

    protected buildTool(method: ToolBuilderMethod): IPromptTool {
        const definition = toolDefinitions[method];
        const serviceMethod = this.options.service[method];

        if (typeof serviceMethod !== "function") {
            throw new Error(`Tool method not available on service: ${method}`);
        }

        return {
            name: this.getToolName(method),
            description: definition.description(this.options.entityName),
            parameters: definition.parameters(this),
            navigation: {
                entityName: this.options.entityName,
                method,
                basePath: this.options.navigationBasePath,
            },
            execute: async (args: any) => definition.execute(this.options.service, args),
        };
    }

    protected getToolName(method: ToolBuilderMethod) {
        return `${this.options.toolNamePrefix ?? this.options.entityName}_${method}`;
    }

    protected toJsonSchema(schema: ZodObject<ZodRawShape>) {
        return z.toJSONSchema(schema, {target: "openAi"});
    }

    protected getTypeName(field: any): string | undefined {
        return field?.constructor?.name;
    }

    protected fieldAdapter(field: unknown): ZodTypeAny {
        const f: any = field;
        const typeName = this.getTypeName(f);

        if (typeof f?.unwrap === "function" && typeName === "ZodOptional") {
            return this.fieldAdapter(f.unwrap()).optional();
        }

        if (typeof f?.unwrap === "function" && typeName === "ZodNullable") {
            return this.fieldAdapter(f.unwrap()).nullable();
        }

        if (typeof f?.unwrap === "function" && typeName === "ZodDefault") {
            return this.fieldAdapter(f.unwrap()).default(f.def.defaultValue);
        }

        if (typeof f?.unwrap === "function" && typeName === "ZodCatch") {
            return this.fieldAdapter(f.unwrap()).catch(f.def.catchValue);
        }

        if (typeof f?.unwrap === "function" && typeName === "ZodReadonly") {
            return this.fieldAdapter(f.unwrap()).readonly();
        }

        if (typeName === "ZodArray" && f?.element) {
            return z.array(this.fieldAdapter(f.element));
        }

        if (typeName === "ZodObject" && f?.shape) {
            return this.schemaAdapter(f);
        }

        if (typeName === "ZodDate") {
            return z.iso.datetime();
        }

        return f as ZodTypeAny;
    }

    protected schemaAdapter<TObj extends ZodObject<ZodRawShape>>(schema: TObj): TObj {
        const shape = (schema as any).shape as Record<string, unknown>;
        const newShape: Record<string, ZodTypeAny> = {};

        for (const key of Object.keys(shape)) {
            newShape[key] = this.fieldAdapter(shape[key]);
        }

        return z.object(newShape) as unknown as TObj;
    }
}

export default BuilderTool;
export {BuilderTool};
