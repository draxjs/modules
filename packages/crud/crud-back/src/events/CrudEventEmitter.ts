import {EventEmitter} from 'events';
import {IDraxCrudEvent} from "@drax/crud-share";


class CrudEventEmitter extends EventEmitter {
    private static instance: CrudEventEmitter;

    private constructor() {
        super();
        this.setMaxListeners(100); // Aumentar el límite de listeners si es necesario
    }

    static getInstance(): CrudEventEmitter {
        if (!CrudEventEmitter.instance) {
            CrudEventEmitter.instance = new CrudEventEmitter();
        }
        return CrudEventEmitter.instance;
    }

    emitCrudEvent<T>(eventData: IDraxCrudEvent<T>): void {
        this.emit('crud:event', eventData);
    }
}

export default CrudEventEmitter;
export {CrudEventEmitter};
