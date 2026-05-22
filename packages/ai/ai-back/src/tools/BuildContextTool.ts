import {setNestedValue, UnauthorizedError} from "@drax/common-back";
import type {IDraxFieldFilter, IDraxPermission} from "@drax/crud-share";
import {BuilderTool} from "./BuilderTool.js";
import type {DraxAgentPromptContext} from "../interfaces/IDraxAgent.js";
import type {ToolBuilderOptions, ToolBuilderService} from "../interfaces/IBuilderTool.js";

interface BuildContextToolContext {
    userId?: string | null;
    tenantId?: string | null;
    permissions?: string[];
    hasSomePermission?: (permissions: string[]) => boolean;
}

interface BuildContextToolOptions<T = any, C = any, U = any> extends ToolBuilderOptions<T, C, U> {
    context?: BuildContextToolContext;
    permission?: Partial<IDraxPermission>;
    tenantField?: string;
    userField?: string;
    tenantFilter?: boolean;
    tenantSetter?: boolean;
    tenantAssert?: boolean;
    userFilter?: boolean;
    userSetter?: boolean;
    userAssert?: boolean;
    defaultLimit?: number;
}

type BuildContextToolOptionsInput<T = any, C = any, U = any> =
    Omit<BuildContextToolOptions<T, C, U>, "context">;

class BuildContextTool<T = any, C = any, U = any> extends BuilderTool<T, C, U> {
    constructor(options: BuildContextToolOptions<T, C, U>) {
        super({
            ...options,
            service: BuildContextTool.createContextService(options),
        });
    }

    static fromPromptContext<T = any, C = any, U = any>(
        options: BuildContextToolOptionsInput<T, C, U>,
        promptContext: DraxAgentPromptContext,
    ): BuildContextTool<T, C, U> {
        return new BuildContextTool({
            ...options,
            context: {
                userId: promptContext.input?.userId ?? promptContext.session.userId ?? null,
                tenantId: promptContext.input?.tenantId ?? promptContext.session.tenantId ?? null,
            },
        });
    }

    protected static createContextService<T = any, C = any, U = any>(
        options: BuildContextToolOptions<T, C, U>,
    ): ToolBuilderService<T, C, U> {
        const service = options.service;
        const helper = new BuildContextToolServiceHelper(options);
        const contextService: ToolBuilderService<T, C, U> = {...service};

        if (typeof service.create === "function") {
            contextService.create = async (data: any) => service.create?.(helper.applySetters(helper.clonePayload(data)));
        }

        if (typeof service.update === "function") {
            contextService.update = async (id: string, data: any) => {
                const preItem = await service.findById?.(id);
                helper.assertWritable(preItem, "update");
                const payload = helper.removeSetterFields(helper.clonePayload(data));
                return service.update?.(id, payload);
            };
        }

        if (typeof service.updatePartial === "function") {
            contextService.updatePartial = async (id: string, data: any) => {
                const preItem = await service.findById?.(id);
                helper.assertWritable(preItem, "update");
                const payload = helper.removeSetterFields(helper.clonePayload(data));
                return service.updatePartial?.(id, payload);
            };
        }

        if (typeof service.delete === "function") {
            contextService.delete = async (id: string) => {
                const item = await service.findById?.(id);
                helper.assertWritable(item, "delete");
                return service.delete?.(id);
            };
        }

        if (typeof service.findById === "function") {
            contextService.findById = async (id: string) => {
                const item = await service.findById?.(id);
                helper.assertReadable(item);
                return item;
            };
        }

        if (typeof service.findByIds === "function") {
            contextService.findByIds = async (ids: string[]) => {
                const items = await service.findByIds?.(ids);
                helper.assertReadableItems(items);
                return items;
            };
        }

        if (typeof service.findOneBy === "function") {
            contextService.findOneBy = async (field: string, value: any, filters: IDraxFieldFilter[] = []) =>
                service.findOneBy?.(field, value, helper.applyReadFilters(filters));
        }

        if (typeof service.findOne === "function") {
            contextService.findOne = async (findOptions: any) =>
                service.findOne?.({
                    ...findOptions,
                    filters: helper.applyReadFilters(findOptions?.filters ?? []),
                });
        }

        if (typeof service.findBy === "function") {
            contextService.findBy = async (field: string, value: any, limit: number = helper.defaultLimit, filters: IDraxFieldFilter[] = []) =>
                service.findBy?.(field, value, limit, helper.applyReadFilters(filters));
        }

        if (typeof service.fetchAll === "function") {
            contextService.fetchAll = async () => {
                const filters = helper.applyReadFilters([]);

                if (filters.length > 0 && typeof service.find === "function") {
                    return service.find({
                        search: "",
                        filters,
                        order: false,
                        orderBy: "",
                        limit: helper.defaultLimit,
                    });
                }

                return service.fetchAll?.();
            };
        }

        if (typeof service.findFirst === "function") {
            contextService.findFirst = async (quantity: number, filters: IDraxFieldFilter[] = []) =>
                service.findFirst?.(quantity, helper.applyReadFilters(filters));
        }

        if (typeof service.findLast === "function") {
            contextService.findLast = async (quantity: number, filters: IDraxFieldFilter[] = []) =>
                service.findLast?.(quantity, helper.applyReadFilters(filters));
        }

        if (typeof service.search === "function") {
            contextService.search = async (value: string, limit: number = helper.defaultLimit, filters: IDraxFieldFilter[] = []) =>
                service.search?.(value, limit, helper.applyReadFilters(filters));
        }

        if (typeof service.find === "function") {
            contextService.find = async (findOptions: any) =>
                service.find?.({
                    ...findOptions,
                    filters: helper.applyReadFilters(findOptions?.filters ?? []),
                });
        }

        if (typeof service.paginate === "function") {
            contextService.paginate = async (paginateOptions: any) =>
                service.paginate?.({
                    ...paginateOptions,
                    filters: helper.applyReadFilters(paginateOptions?.filters ?? []),
                });
        }

        if (typeof service.groupBy === "function") {
            contextService.groupBy = async (groupByOptions: any) =>
                service.groupBy?.({
                    ...groupByOptions,
                    filters: helper.applyReadFilters(groupByOptions?.filters ?? []),
                });
        }

        return contextService;
    }
}

class BuildContextToolServiceHelper {
    readonly defaultLimit: number;

    private readonly context: BuildContextToolContext;
    private readonly permission?: Partial<IDraxPermission>;
    private readonly tenantField: string;
    private readonly userField: string;
    private readonly tenantFilter: boolean;
    private readonly tenantSetter: boolean;
    private readonly tenantAssert: boolean;
    private readonly userFilter: boolean;
    private readonly userSetter: boolean;
    private readonly userAssert: boolean;

    constructor(options: BuildContextToolOptions) {
        this.context = options.context ?? {};
        this.permission = options.permission;
        this.tenantField = options.tenantField ?? "tenant";
        this.userField = options.userField ?? "user";
        this.tenantFilter = options.tenantFilter ?? false;
        this.tenantSetter = options.tenantSetter ?? false;
        this.tenantAssert = options.tenantAssert ?? false;
        this.userFilter = options.userFilter ?? false;
        this.userSetter = options.userSetter ?? false;
        this.userAssert = options.userAssert ?? false;
        this.defaultLimit = options.defaultLimit ?? 1000;
    }

    clonePayload<TPayload>(payload: TPayload): TPayload {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return payload;
        }

        return {...payload};
    }

    applySetters<TPayload>(payload: TPayload): TPayload {
        if (!payload || typeof payload !== "object") {
            return payload;
        }

        if (this.tenantSetter && this.context.tenantId) {
            setNestedValue(payload as object, this.tenantField, this.context.tenantId);
        }

        if (this.userSetter && this.context.userId) {
            setNestedValue(payload as object, this.userField, this.context.userId);
        }

        return payload;
    }

    removeSetterFields<TPayload>(payload: TPayload): TPayload {
        if (!payload || typeof payload !== "object") {
            return payload;
        }

        if (this.tenantSetter) {
            this.deleteNestedValue(payload as Record<string, any>, this.tenantField);
        }

        if (this.userSetter) {
            this.deleteNestedValue(payload as Record<string, any>, this.userField);
        }

        return payload;
    }

    applyReadFilters(filters: IDraxFieldFilter[] = []): IDraxFieldFilter[] {
        const nextFilters = [...filters];

        if (this.tenantFilter && this.context.tenantId) {
            nextFilters.push({field: this.tenantField, operator: "eq", value: this.context.tenantId});
        }

        if (
            this.userFilter &&
            this.context.userId &&
            !this.hasSomePermission([this.permission?.All, this.permission?.ViewAll])
        ) {
            nextFilters.push({field: this.userField, operator: "eq", value: this.context.userId});
        }

        return nextFilters;
    }

    assertReadable(item: any): void {
        if (this.hasSomePermission([this.permission?.All, this.permission?.ViewAll])) {
            this.assertTenant(item);
            return;
        }

        this.assertTenant(item);
        this.assertUser(item);
    }

    assertReadableItems(items: any): void {
        if (!Array.isArray(items)) {
            return;
        }

        items.forEach(item => this.assertReadable(item));
    }

    assertWritable(item: any, operation: "update" | "delete"): void {
        const allPermission = this.permission?.All;
        const operationAllPermission = operation === "update"
            ? this.permission?.UpdateAll
            : this.permission?.DeleteAll;

        if (!this.hasSomePermission([allPermission, operationAllPermission])) {
            this.assertUser(item);
        }

        this.assertTenant(item);
    }

    private assertTenant(item: any): void {
        if (!this.tenantAssert || !this.context.tenantId) {
            return;
        }

        const tenantId = this.resolveItemFieldId(item, this.tenantField);
        if (tenantId) {
            this.assertId(this.context.tenantId, tenantId);
        }
    }

    private assertUser(item: any): void {
        if (!this.userAssert || !this.context.userId) {
            return;
        }

        const userId = this.resolveItemFieldId(item, this.userField);
        if (userId) {
            this.assertId(this.context.userId, userId);
        }
    }

    private assertId(expectedId: string, actualId: string): void {
        if (expectedId !== actualId) {
            throw new UnauthorizedError();
        }
    }

    private hasSomePermission(permissions: Array<string | undefined>): boolean {
        const requiredPermissions = permissions.filter((permission): permission is string => !!permission);

        if (requiredPermissions.length === 0) {
            return false;
        }

        if (this.context.hasSomePermission?.(requiredPermissions)) {
            return true;
        }

        return requiredPermissions.some(permission => this.context.permissions?.includes(permission));
    }

    private resolveItemFieldId(item: any, field: string): string | null {
        const value = this.getNestedValue(item, field);
        return this.stringifyRelationId(value);
    }

    private getNestedValue(item: any, path: string): any {
        return path.split(".").reduce((value, key) => value?.[key], item);
    }

    private stringifyRelationId(value: any): string | null {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        const id = value?._id ?? value?.id ?? value;

        if (typeof id === "string" || typeof id === "number" || typeof id === "boolean") {
            return String(id);
        }

        if (typeof id?.toString === "function") {
            const stringId = id.toString();
            return stringId && stringId !== "[object Object]" ? stringId : null;
        }

        return null;
    }

    private deleteNestedValue(payload: Record<string, any>, path: string): void {
        const keys = path.split(".");
        const lastKey = keys.pop();

        if (!lastKey) {
            return;
        }

        const parent = keys.reduce((value, key) => value?.[key], payload);
        if (parent && typeof parent === "object") {
            delete parent[lastKey];
        }
    }
}

export default BuildContextTool;
export {BuildContextTool};
export type {BuildContextToolContext, BuildContextToolOptions};
