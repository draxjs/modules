import {describe, expect, test} from "vitest";
import {z} from "zod";
import {BuilderTool} from "../src/tools/BuilderTool.js";

describe("ToolBuilder", () => {
    const PersonBaseSchema = z.object({
        fullname: z.string().min(1),
        birthdate: z.coerce.date().nullable().optional(),
    });

    test("builds prompt tools and delegates execution to the service", async () => {
        const calls: any[] = [];
        const service: any = {
            async findById(id: string) {
                calls.push(["findById", id]);
                return {_id: id, fullname: "Ada Lovelace"};
            },
            async search(value: string, limit: number, filters: any[]) {
                calls.push(["search", value, limit, filters]);
                return [{_id: "1", fullname: "Ada Lovelace"}];
            },
        };

        const builder = new BuilderTool({
            entityName: "person",
            entityDescription: "Personas registradas en el sistema",
            schema: PersonBaseSchema,
            service,
            methods: ["findById", "search"],
        });

        const tools = builder.getTools();

        expect(tools.map(tool => tool.name)).toEqual(["person_findById", "person_search"]);
        expect(tools[0].parameters).toMatchObject({
            type: "object",
            properties: {
                id: {type: "string"},
            },
        });

        await expect(tools[0].execute({id: "123"})).resolves.toEqual({
            _id: "123",
            fullname: "Ada Lovelace",
        });

        await expect(tools[1].execute({value: "Ada"})).resolves.toEqual([
            {_id: "1", fullname: "Ada Lovelace"},
        ]);

        expect(calls).toEqual([
            ["findById", "123"],
            ["search", "Ada", 1000, []],
        ]);
    });

    test("builds the system prompt section with entity and tool descriptions", () => {
        const service: any = {
            async create(data: any) {
                return data;
            },
        };

        const builder = new BuilderTool({
            entityName: "person",
            entityDescription: "Personas registradas en el sistema",
            schema: PersonBaseSchema,
            service,
            methods: ["create"],
        });

        const section = builder.getSystemPromptSection();

        expect(section).toContain("[ENTIDAD: person]");
        expect(section).toContain("Personas registradas en el sistema");
        expect(section).toContain("person_create: Crear un registro de person");
        expect(section).toContain("Schema JSON de la entidad");
    });

    test("fails when a requested service method is not available", () => {
        const builder = new BuilderTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service: {} as any,
            methods: ["delete"],
        });

        expect(() => builder.getTools()).toThrow("Tool method not available on service: delete");
    });
});
