import {ISettingRepository} from "../interfaces/ISettingRepository";
import {settingSchema} from "../schemas/SettingSchema.js";
import {ISetting, ISettingBase} from "@drax/settings-share";
import {ValidationError} from "@drax/common-back";
import {AbstractService} from "@drax/crud-back";
import {DraxCache, ZodErrorToValidationError} from "@drax/common-back";
import {ZodError} from "zod";

class SettingService extends AbstractService<ISetting, ISettingBase, ISettingBase> {

    protected _repository: ISettingRepository
    protected _cache: DraxCache<ISetting> = new DraxCache()

    constructor(repostitory: ISettingRepository) {
        super(repostitory, settingSchema)
        this._repository = repostitory
    }


    async cache(key: string): Promise<ISetting> {
        return this._cache.getOrLoad(key,
            async () => {
                return await this.findByKey(key)
            },
            20000)
    }

    async cacheValue(key: string): Promise<any> {
        let setting = await this.cache(key)
        return setting?.value
    }

    async findByKey(key: string): Promise<ISetting | undefined> {
        return this._repository.findOneBy("key", key)
    }

    async fetchAll(): Promise<ISetting[]> {
        return await this._repository.fetchAll()
    }

    async fetchGrouped(): Promise<{ [key: string]: ISetting[] }> {
        const settings = await this._repository.fetchAll()
        return settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {} as { [key: string]: ISetting[] });
    }

    async updateValue(id: string, value: string, updatedBy: string): Promise<ISetting | undefined> {
        const setting = await this.findById(id)
        if(setting.regex){
            const regex = new RegExp(setting.regex)
            if (!regex.test(value)) {
                throw new ValidationError([
                    {field: 'value', reason: "setting.invalid_regex", value: value}
                ])
            }
        }
        return this._repository.updatePartial(id, {value, updatedBy})
    }

    async create(data: ISettingBase): Promise<ISetting> {
        try {
            await settingSchema.parseAsync(data)
            if (Array.isArray(data.value)) {
                data.value = JSON.stringify(data.value)
            }
            const setting = await this._repository.create(data)
            return setting
        } catch (e) {
            console.error("Error on create setting", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, data)
            }
            throw e
        }
    }

    async update(id: string, data: ISettingBase): Promise<ISetting> {
        try {
            await settingSchema.parseAsync(data)
            //Borramos el valor para evitar el conflicto de actualización
            delete data.value
            const setting = await this._repository.update(id, data)
            return setting
        } catch (e) {
            console.error("Error on update setting", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, data)
            }
            throw e
        }
    }

    async createOrUpdate(data: ISettingBase): Promise<ISetting> {
        try {
            await settingSchema.parseAsync(data)
            const setting = await this._repository.findOneBy("key", data.key)
            if (setting) {
                delete data.value
                return await this._repository.updatePartial(setting._id, data)
            } else {
                return await this._repository.create(data)
            }
        } catch (e) {
            console.error("Error on create or update setting", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, data)
            }
            throw e
        }
    }

}

export default SettingService
export {SettingService}
