import {IDraxConfig} from "../interfaces/IDraxConfig";


const config: IDraxConfig = {}

class DraxConfig {


    static get(key: string): any {
        return config[key]
    }

    static set(key: string, value: any): any {
        config[key] = value
        return config[key]
    }

    static getOrLoad(key:string){
        return DraxConfig.get(key) || DraxConfig.set(key, process.env[key])
    }

    static getAll(): IDraxConfig {
        return config;
    }

}


export default DraxConfig;

export {DraxConfig}
