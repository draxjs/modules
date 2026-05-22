import {describe, expect, test} from "vitest";
import {z} from "zod";
import {BuildContextTool} from "../src/tools/BuildContextTool.js";

describe("BuildContextTool", () => {
    const PersonBaseSchema = z.object({
        fullname: z.string().min(1),
        tenant: z.string().optional(),
        user: z.string().optional(),
    });

    test("sets user and tenant context on create payloads", async () => {
        const calls: any[] = [];
        const service: any = {
            async create(data: any) {
                calls.push(data);
                return data;
            },
        };

        const builder = new BuildContextTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service,
            methods: ["create"],
            context: {
                userId: "user-1",
                tenantId: "tenant-1",
            },
            userSetter: true,
            tenantSetter: true,
        });

        const [tool] = builder.getTools();
        await expect(tool.execute({data: {fullname: "Ada Lovelace"}})).resolves.toEqual({
            fullname: "Ada Lovelace",
            tenant: "tenant-1",
            user: "user-1",
        });

        expect(calls).toEqual([{
            fullname: "Ada Lovelace",
            tenant: "tenant-1",
            user: "user-1",
        }]);
    });

    test("adds user and tenant filters to read operations", async () => {
        const calls: any[] = [];
        const service: any = {
            async search(value: string, limit: number, filters: any[]) {
                calls.push(["search", value, limit, filters]);
                return [];
            },
            async paginate(options: any) {
                calls.push(["paginate", options]);
                return {items: [], total: 0};
            },
        };

        const builder = new BuildContextTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service,
            methods: ["search", "paginate"],
            context: {
                userId: "user-1",
                tenantId: "tenant-1",
            },
            userFilter: true,
            tenantFilter: true,
        });

        const [searchTool, paginateTool] = builder.getTools();

        await searchTool.execute({
            value: "Ada",
            filters: [{field: "active", operator: "eq", value: true}],
        });
        await paginateTool.execute({page: 1, limit: 5});

        expect(calls).toEqual([
            ["search", "Ada", 1000, [
                {field: "active", operator: "eq", value: true},
                {field: "tenant", operator: "eq", value: "tenant-1"},
                {field: "user", operator: "eq", value: "user-1"},
            ]],
            ["paginate", {
                page: 1,
                limit: 5,
                orderBy: undefined,
                order: "asc",
                search: "",
                filters: [
                    {field: "tenant", operator: "eq", value: "tenant-1"},
                    {field: "user", operator: "eq", value: "user-1"},
                ],
            }],
        ]);
    });

    test("asserts tenant and user ownership on item operations", async () => {
        const service: any = {
            async findById(id: string) {
                return {_id: id, fullname: "Grace Hopper", tenant: "tenant-2", user: "user-1"};
            },
        };

        const builder = new BuildContextTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service,
            methods: ["findById"],
            context: {
                userId: "user-1",
                tenantId: "tenant-1",
            },
            userAssert: true,
            tenantAssert: true,
        });

        const [tool] = builder.getTools();

        await expect(tool.execute({id: "123"})).rejects.toMatchObject({
            name: "UnauthorizedError",
        });
    });

    test("removes ownership fields on updates when setters are enabled", async () => {
        const calls: any[] = [];
        const service: any = {
            async findById(id: string) {
                return {_id: id, tenant: "tenant-1", user: "user-1"};
            },
            async updatePartial(id: string, data: any) {
                calls.push([id, data]);
                return {_id: id, ...data};
            },
        };

        const builder = new BuildContextTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service,
            methods: ["updatePartial"],
            context: {
                userId: "user-1",
                tenantId: "tenant-1",
            },
            userSetter: true,
            tenantSetter: true,
            userAssert: true,
            tenantAssert: true,
        });

        const [tool] = builder.getTools();
        await tool.execute({
            id: "123",
            data: {
                fullname: "Ada",
                tenant: "tenant-2",
                user: "user-2",
            },
        });

        expect(calls).toEqual([["123", {fullname: "Ada"}]]);
    });

    test("fails when a requested service method is not available", () => {
        const builder = new BuildContextTool({
            entityName: "person",
            schema: PersonBaseSchema,
            service: {} as any,
            methods: ["delete"],
            context: {
                userId: "user-1",
                tenantId: "tenant-1",
            },
        });

        expect(() => builder.getTools()).toThrow("Tool method not available on service: delete");
    });
});
