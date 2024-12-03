import {II18nMessages} from "../interfaces/II18nMessages";
import merge from "deepmerge"

class DraxI18n {
    private locale: string = 'en';
    private messages: II18nMessages = {};

    constructor(locale:string = 'en', messages: II18nMessages = {}){
        this.locale = locale;
        this.messages = messages;
    }

    setLocale(locale:string){
        this.locale = locale;
    }

    setMessages(messages:II18nMessages){
        this.messages = messages;
    }

    addMessages(messages:II18nMessages){
        this.messages = merge.all([this.messages,messages]) as II18nMessages;
    }

    t(key:string, params?:any):any{
        if(this.messages[this.locale][key]){
            return this.messages[this.locale][key];
        }else{
            return key;
        }
    }
}

export default DraxI18n;
