import CrudSavedQueryController from "../controllers/CrudSavedQueryController.js";
import {CrudSchemaBuilder} from "../../builders/CrudSchemaBuilder.js";
import {CrudSavedQuerySchema, CrudSavedQueryBaseSchema} from "../schemas/CrudSavedQuerySchema.js";

async function CrudSavedQueryFastifyRoutes(fastify, options) {
    const controller = new CrudSavedQueryController();
    const schemas = new CrudSchemaBuilder(
        CrudSavedQuerySchema,
        CrudSavedQueryBaseSchema,
        CrudSavedQueryBaseSchema,
        "CrudSavedQuery",
        "openapi-3.0",
        ["crud-saved-queries"]
    );

    fastify.get("/api/crud-saved-queries", {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req, rep));
    fastify.get("/api/crud-saved-queries/find", {schema: schemas.findSchema}, (req, rep) => controller.find(req, rep));
    fastify.get("/api/crud-saved-queries/search", {schema: schemas.searchSchema}, (req, rep) => controller.search(req, rep));
    fastify.get("/api/crud-saved-queries/:id", {schema: schemas.findByIdSchema}, (req, rep) => controller.findById(req, rep));
    fastify.get("/api/crud-saved-queries/find-one", {schema: schemas.findOneSchema}, (req, rep) => controller.findOne(req, rep));
    fastify.get("/api/crud-saved-queries/find-by/:field/:value", {schema: schemas.findBySchema}, (req, rep) => controller.findBy(req, rep));
    fastify.get("/api/crud-saved-queries/find-one-by/:field/:value", {schema: schemas.findOneBySchema}, (req, rep) => controller.findOneBy(req, rep));

    fastify.post("/api/crud-saved-queries", {schema: schemas.createSchema}, (req, rep) => controller.create(req, rep));
    fastify.put("/api/crud-saved-queries/:id", {schema: schemas.updateSchema}, (req, rep) => controller.update(req, rep));
    fastify.patch("/api/crud-saved-queries/:id", {schema: schemas.updateSchema}, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete("/api/crud-saved-queries/:id", {schema: schemas.deleteSchema}, (req, rep) => controller.delete(req, rep));
}

export default CrudSavedQueryFastifyRoutes;
export {CrudSavedQueryFastifyRoutes};
