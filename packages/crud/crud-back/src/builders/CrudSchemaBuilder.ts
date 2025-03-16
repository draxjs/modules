import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  IdParamSchema,
  DeleteBodyResponseSchema,
  PaginateQuerySchema,
  PaginateBodyResponseSchema,
  FindQuerySchema,
  SearchQuerySchema,
  FindByParamSchema,
  ErrorBodyResponseSchema,
  ValidationErrorBodyResponseSchema
} from '../index.js';

export class CrudSchemaBuilder<T extends z.ZodObject<z.ZodRawShape>, TBase extends z.ZodObject<z.ZodRawShape>> {
  private entitySchema: T;
  private entityBaseSchema: TBase;
  private entityName: string;

  constructor(entitySchema: T, entityBaseSchema: TBase, entityName: string) {
    this.entitySchema = entitySchema;
    this.entityBaseSchema = entityBaseSchema;
    this.entityName = entityName;
  }

  /**
   * Get JSON schema for finding an entity by ID
   */
  get findByIdSchema() {
    return {
      params: zodToJsonSchema(IdParamSchema),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for finding an entity by IDs
   */
  get findByIdsSchema() {
    return {
      params: zodToJsonSchema(z.object({
        ids: z.string().regex(/^[^,]+(,[^,]+)*$/, "Debe ser una lista de valores separados por coma sin comas consecutivas")
      })),
      response: {
        200: zodToJsonSchema(z.array(this.entitySchema)),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for search an entity
   */
  get searchSchema() {
    return {
      query: zodToJsonSchema(SearchQuerySchema),
      response: {
        200: zodToJsonSchema(z.array(this.entitySchema)),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    }
  }

  /**
   * Get JSON schema for find entities
   */
  get findSchema() {
    return {
      query: zodToJsonSchema(FindQuerySchema),
      response: {
        200: zodToJsonSchema(z.array(this.entitySchema)),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    }
  }

  /**
   * Get JSON schema for find one entity
   */
  get findOneSchema() {
    return {
      params: zodToJsonSchema(FindQuerySchema),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for findBy entities
   */
  get findBySchema() {
    return {
      params: zodToJsonSchema(FindByParamSchema),
      response: {
        200: zodToJsonSchema(z.array(this.entitySchema)),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for findBy entities
   */
  get findOneBySchema() {
    return {
      params: zodToJsonSchema(FindByParamSchema),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for paginating entities
   */
  get paginateSchema() {
    return {
      query: zodToJsonSchema(PaginateQuerySchema),
      response: {
        200: zodToJsonSchema(PaginateBodyResponseSchema.extend({
          items: z.array(this.entitySchema)
        })),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for all entities
   */
  get allSchema() {
    return {
      response: {
        200: zodToJsonSchema(z.array(this.entitySchema)),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for creating an entity
   */
  get createSchema() {
    return {
      body: zodToJsonSchema(this.entityBaseSchema),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        422: zodToJsonSchema(ValidationErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for updating an entity
   */
  get updateSchema() {
    return {
      params: zodToJsonSchema(IdParamSchema),
      body: zodToJsonSchema(this.entityBaseSchema),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        422: zodToJsonSchema(ValidationErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for updating an entity
   */
  get updatePartialSchema() {
    return {
      params: zodToJsonSchema(IdParamSchema),
      body: zodToJsonSchema(this.entityBaseSchema.partial()),
      response: {
        200: zodToJsonSchema(this.entitySchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        422: zodToJsonSchema(ValidationErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
      }
    };
  }

  /**
   * Get JSON schema for deleting an entity
   */
  get deleteSchema() {
    return {
      params: zodToJsonSchema(IdParamSchema),
      response: {
        200: zodToJsonSchema(DeleteBodyResponseSchema),
        400: zodToJsonSchema(ErrorBodyResponseSchema),
        401: zodToJsonSchema(ErrorBodyResponseSchema),
        500: zodToJsonSchema(ErrorBodyResponseSchema)
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
