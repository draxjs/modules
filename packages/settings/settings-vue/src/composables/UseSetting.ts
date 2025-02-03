import {useSettingStore} from "../stores/UseSettingStore";
import {computed} from "vue";
import {SettingProviderFactory} from "@drax/settings-front";
import type {ISetting} from "@drax/settings-share";

export function useSetting() {

    const store = useSettingStore()
    const provider = SettingProviderFactory.getInstance()


    const loading = computed({
        get() {
            return store.loading
        }, set(value) {
            store.setLoading(value)
        }
    })

    const settings = computed({
        get() {
            return store.settings
        }, set(value) {
            store.setSettings(value)
        }
    })

    const settingValue = computed(()=>{
        return (key:string) => store.getSettingValueByKey(key)
    })

    const settingsGrouped = computed(() => {
        return settings.value.reduce((acc, item) => {
            if (!acc[item.group]) {
                acc[item.group] = [];
            }
            acc[item.group].push(item);
            return acc;
        }, {} as { [key: string]: ISetting[] });
    })


    async function fetchSettings(): Promise<ISetting[]> {
        try {
            store.setLoading(true)
            const settings = await provider.fetchAll()
            store.setSettings(settings)
            return settings
        } catch (e) {
            console.error("UseSettings fetchSettings", e)
            throw e
        } finally {
            store.setLoading(false)
        }
    }

    async function updateSettingValue(id:string,value:string): Promise<ISetting> {
        try {
            store.setLoading(true)
            const setting: ISetting = await provider.updateValue(id,value)
            store.updateSetting(setting)
            return setting
        } catch (e) {
            console.error("UseSettings fetchSettings", e)
            throw e
        } finally {
            store.setLoading(false)
        }
    }



    return {
        fetchSettings,
        updateSettingValue,

        settings,
        settingsGrouped,
        settingValue,
        loading,

    }

}
