import TTSVoiceServiceFactory from "../factory/services/TTSVoiceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TTSVoicePermissions from "../permissions/TTSVoicePermissions.js";
import type {ITTSVoice, ITTSVoiceBase} from "../interfaces/ITTSVoice";

class TTSVoiceController extends AbstractFastifyController<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> {

    constructor() {
        super(TTSVoiceServiceFactory.instance, TTSVoicePermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default TTSVoiceController;
export {
    TTSVoiceController
}
