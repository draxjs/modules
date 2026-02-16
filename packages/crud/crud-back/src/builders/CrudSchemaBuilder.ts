import { z, type ZodTypeAny } from 'zod';

import {
  IdParamSchema,
  DeleteBodyResponseSchema,
  PaginateQuerySchema,
  PaginateBodyResponseSchema,
  FindQuerySchema,
  SearchQuerySchema,
  FindByParamSchema,
  ErrorBodyResponseSchema,
  ValidationErrorBodyResponseSchema,
  ExportBodyResponseSchema,
  GroupByQuerySchema
} from '../index.js';

export class CrudSchemaBuilder<
  T extends z.ZodObject<z.ZodRawShape>,
  TCreate extends z.ZodObject<z.ZodRawShape>,
  TUpdate extends z.ZodObject<z.ZodRawShape>
> {
  private entitySchema: T;
  private entityCreateSchema: TCreate;
  private entityUpdateSchema: TUpdate;
  private entityName: string;
  private tags: string[];
  private target: string = 'openapi-3.0'; //"jsonSchema7" | "jsonSchema2019-09" | "openapi-3.0" | "openAi"

  constructor(entitySchema: T, entityCreateSchema: TCreate, entityUpdateSchema: TUpdate, entityName: string, target:string = 'openapi-3.0', tags: string[] = []) {
    this.entitySchema = this.schemaAdapter(entitySchema);
    this.entityCreateSchema = entityCreateSchema;
    this.entityUpdateSchema = entityUpdateSchema;
    this.entityName = entityName;
    this.tags = tags
    this.target = target;
  }

  private getTypeName(field: any): string | undefined {
    // Zod v4 suele tener constructor.name útil en runtime
    return field?.constructor?.name;
  }

  fieldAdapter(field: unknown): ZodTypeAny {
    const f: any = field;

    const typeName = this.getTypeName(f);

    // 1) Desenrollar wrappers por "duck typing" (evita líos de tipos en Zod 4)
    if (typeof f?.unwrap === 'function' && typeName === 'ZodOptional') {
      return this.fieldAdapter(f.unwrap()).optional();
    }

    if (typeof f?.unwrap === 'function' && typeName === 'ZodNullable') {
      return this.fieldAdapter(f.unwrap()).nullable();
    }

    // 2) Tipos compuestos
    if (typeName === 'ZodArray' && f?.element) {
      return z.array(this.fieldAdapter(f.element));
    }

    if (typeName === 'ZodObject' && f?.shape) {
      return this.schemaAdapter(f);
    }

    // 3) Date -> ISO datetime (string)
    if (typeName === 'ZodDate') {
      return z.iso.datetime();
    }

    // 4) Fallback: dejar tal cual
    return f as ZodTypeAny;
  }

  schemaAdapter<TObj extends z.ZodObject<z.ZodRawShape>>(entitySchema: TObj): TObj {
    const shape = (entitySchema as any).shape as Record<string, unknown>;
    const newShape: Record<string, ZodTypeAny> = {};

    for (const key of Object.keys(shape)) {
      newShape[key] = this.fieldAdapter(shape[key]);
    }

    // Re-creamos el objeto con el nuevo shape.
    // Tipamos como TObj para mantener la firma genérica del builder.
    return z.object(newShape) as unknown as TObj;
  }

  get getTags() {
    if (this.tags.length > 0) {
      return { tags: this.tags };
    }
    return [];
  }

  get jsonEntityCreateSchema() {
    return z.toJSONSchema(this.entityCreateSchema, { target: this.target });
  }

  get jsonEntityUpdateSchema() {
    return z.toJSONSchema(this.entityUpdateSchema, { target: this.target });
  }

  get jsonEntitySchema() {
    return z.toJSONSchema(this.entitySchema, { target: this.target });
  }

  get jsonEntityArraySchema() {
    return z.toJSONSchema(z.array(this.entitySchema), { target: this.target });
  }

  get jsonEntityGroupBySchema() {
    return z.toJSONSchema(
      z.array(
        z
          .object({
            count: z.number()
          })
          .catchall(z.any())
      ),
      { target: this.target }
    );
  }

  get jsonExportBodyResponse() {
    return z.toJSONSchema(ExportBodyResponseSchema, { target: this.target });
  }

  get jsonErrorBodyResponse() {
    return z.toJSONSchema(ErrorBodyResponseSchema, { target: this.target });
  }

  get jsonValidationErrorBodyResponse() {
    return z.toJSONSchema(ValidationErrorBodyResponseSchema, { target: this.target });
  }

  get jsonFindQuerySchema() {
    return z.toJSONSchema(FindQuerySchema, { target: this.target });
  }

  get jsonGroupByQuerySchema() {
    return z.toJSONSchema(GroupByQuerySchema, { target: this.target });
  }

  get jsonSearchQuerySchema() {
    return z.toJSONSchema(SearchQuerySchema, { target: this.target });
  }

  get jsonPaginateQuerySchema() {
    return z.toJSONSchema(PaginateQuerySchema, { target: this.target });
  }

  get jsonDeleteBodyResponseSchema() {
    return z.toJSONSchema(DeleteBodyResponseSchema, { target: this.target });
  }

  get jsonFindByParamSchema() {
    return z.toJSONSchema(FindByParamSchema, { target: this.target });
  }

  get jsonPaginateBodyResponseSchema() {
    return z.toJSONSchema(
      PaginateBodyResponseSchema.extend({
        items: z.array(this.entitySchema)
      }),
      { target: this.target }
    );
  }

  get jsonIdParamSchema() {
    return z.toJSONSchema(IdParamSchema, { target: this.target });
  }


  /**
   * Get JSON schema for export
   */
  get exportSchema(){
    return {
      ...(this.getTags),
      query: this.jsonFindQuerySchema,
      response: {
        200: this.jsonExportBodyResponse,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for finding an entity by ID
   */
  get findByIdSchema() {
    return {
      ...(this.getTags),
      params: this.jsonIdParamSchema,
      response: {
        200: this.jsonEntitySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for finding an entity by IDs
   */
  get findByIdsSchema() {
    return {
      ...(this.getTags),
      params: z.toJSONSchema(z.object({
        ids: z.string().regex(/^[^,]+(,[^,]+)*$/, "Debe ser una lista de valores separados por coma sin comas consecutivas")
      }), {target: this.target}),
      response: {
        200: this.jsonEntityArraySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for search an entity
   */
  get searchSchema() {
    return {
      ...(this.getTags),
      query: this.jsonSearchQuerySchema,
      response: {
        200: this.jsonEntityArraySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    }
  }

  /**
   * Get JSON schema for find entities
   */
  get groupBySchema() {
    return {
      ...(this.getTags),
      query: this.jsonGroupByQuerySchema,
      response: {
        200: this.jsonEntityGroupBySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    }
  }

  /**
   * Get JSON schema for find entities
   */
  get findSchema() {
    return {
      ...(this.getTags),
      query: this.jsonFindQuerySchema,
      response: {
        200: this.jsonEntityArraySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    }
  }

  /**
   * Get JSON schema for find one entity
   */
  get findOneSchema() {
    return {
      ...(this.getTags),
      params: this.jsonFindQuerySchema,
      response: {
        200: this.jsonEntitySchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for findBy entities
   */
  get findBySchema() {
    return {
      ...(this.getTags),
      params: this.jsonFindByParamSchema,
      response: {
        200: this.jsonEntityArraySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for findBy entities
   */
  get findOneBySchema() {
    return {
      ...(this.getTags),
      params: this.jsonFindByParamSchema,
      response: {
        200: this.jsonEntitySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for paginating entities
   */
  get paginateSchema() {
    return {
      ...(this.getTags),
      query: this.jsonPaginateQuerySchema,
      response: {
        200: this.jsonPaginateBodyResponseSchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for all entities
   */
  get allSchema() {
    return {
      ...(this.getTags),
      response: {
        200: this.jsonEntityArraySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for creating an entity
   */
  get createSchema() {
    return {
      ...(this.getTags),
      body: this.jsonEntityCreateSchema,
      response: {
        200: this.jsonEntitySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        422: this.jsonValidationErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for updating an entity
   */
  get updateSchema() {
    return {
      ...(this.getTags),
      params: this.jsonIdParamSchema,
      body: this.jsonEntityUpdateSchema,
      response: {
        200: this.jsonEntitySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        422: this.jsonValidationErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for updating an entity
   */
  get updatePartialSchema() {
    return {
      ...(this.getTags),
      params: this.jsonIdParamSchema,
      body: z.toJSONSchema(this.entityUpdateSchema.partial(), {target: this.target}),
      response: {
        200: this.jsonEntitySchema,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        422: this.jsonValidationErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }

  /**
   * Get JSON schema for deleting an entity
   */
  get deleteSchema() {
    return {
      ...(this.getTags),
      params: this.jsonIdParamSchema,
      response: {
        200: this.jsonDeleteBodyResponseSchema,
        400: this.jsonErrorBodyResponse,
        401: this.jsonErrorBodyResponse,
        403: this.jsonErrorBodyResponse,
        500: this.jsonErrorBodyResponse
      }
    };
  }



  /**
   * Generate route builder function for Fastify with configurable endpoints
   * @param options Configuration options for route generation
   * @param basePath Base API path for the entity
   */
  generateRoutes(
      options: {
        paginate?: boolean;
        all?: boolean;
        export?: boolean;
        search?: boolean;
        findById?: boolean;
        create?: boolean;
        update?: boolean;
        delete?: boolean;
      } = {
        paginate: true,
        all: true,
        export: true,
        search: true,
        findById: true,
        create: true,
        update: true,
        delete: true
      },
      basePath: string = `/api/${this.entityName.toLowerCase()}s`
  ) {
    return (fastify, controller) => {
      // Get all entities with pagination
      if (options.paginate !== false) {
        fastify.get(basePath, {
          schema: this.paginateSchema
        }, (req, rep) => controller.paginate(req, rep));
      }

      // Get all entities without pagination
      if (options.all !== false) {
        fastify.get(`${basePath}/all`, (req, rep) => controller.all(req, rep));
      }

      // Export entities
      if (options.export !== false) {
        fastify.get(`${basePath}/export`, (req, rep) => controller.export(req, rep));
      }

      // Search entities
      if (options.search !== false) {
        fastify.get(`${basePath}/search`, (req, rep) => controller.search(req, rep));
      }

      // Get entity by ID
      if (options.findById !== false) {
        fastify.get(`${basePath}/:id`, {
          schema: this.findByIdSchema
        }, (req, rep) => controller.findById(req, rep));
      }

      // Create entity
      if (options.create !== false) {
        fastify.post(basePath, {
          schema: this.createSchema
        }, (req, rep) => controller.create(req, rep));
      }

      // Update entity
      if (options.update !== false) {
        fastify.put(`${basePath}/:id`, {
          schema: this.updateSchema
        }, (req, rep) => controller.update(req, rep));
      }

      // Delete entity
      if (options.delete !== false) {
        fastify.delete(`${basePath}/:id`, {
          schema: this.deleteSchema
        }, (req, rep) => controller.delete(req, rep));
      }
    };
  }
}

export default CrudSchemaBuilder
