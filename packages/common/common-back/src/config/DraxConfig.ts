import {IDraxConfig} from "../interfaces/IDraxConfig";

const config: IDraxConfig = {}

type ConfigType = 'string' | 'number' | 'boolean';

class DraxConfig {

    static get(key: string): any {
        return config[key]
    }

    static set(key: string, value: any): any {
        config[key] = value
        return config[key]
    }

    static parse(value: any, type: ConfigType): any {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }

        switch (type) {
            case 'number':
                const num = Number(value);
                return isNaN(num) ? undefined : num;
            case 'boolean':
                if (typeof value === 'boolean') return value;
                return value.toString().toLowerCase() === 'true';
            case 'string':
            default:
                return String(value);
        }
    }

    static getOrLoad(key: string, type: ConfigType = 'string', defaultValue?: any): any {
        let value = DraxConfig.get(key);
        
        if (value === undefined || value === null || value === '') {
            value = process.env[key];
        }

        const parsedValue = DraxConfig.parse(value, type);

        if (parsedValue === undefined) {
            if (defaultValue !== undefined) {
                return DraxConfig.set(key, defaultValue);
            }
            return undefined;
        }

        return DraxConfig.set(key, parsedValue);
    }

    static getAll(): IDraxConfig {
        return config;
    }

}

export default DraxConfig;
export {DraxConfig}
