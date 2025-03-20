import {defineStore} from "pinia";
import type {ISetting} from "@drax/settings-share";

export const useSettingStore = defineStore('SettingStore', {
    state: () => (
        {
            loading: false as boolean,
            settings: [] as ISetting[]
        }
    ),
    getters: {
        isSettingsLoading: (state): boolean => state.loading,
        getSettings: (state): ISetting[] => state.settings,
        getSettingByKey: (state) => (key: string): ISetting | undefined => {
            return state.settings.find((setting) => setting.key === key)
        },
        getSettingValueByKey: (state) => (key: string): string | undefined => {
            return state.settings.find((setting) => setting.key === key)?.value
        }
    },
    actions: {
        setLoading(isLoading: boolean): void {
            this.loading = isLoading
        },
        setSettings(settings: ISetting[]): void {
            this.settings = settings
        },
        updateSetting(setting: ISetting): void {
            const index = this.settings.findIndex((s) => s._id === setting._id)
            if (index > -1) {
                this.settings[index] = setting
            } else {
                this.settings.push(setting)
            }
        }

    }

})
