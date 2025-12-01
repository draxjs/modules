import {CrudEventEmitter} from "@drax/crud-back";
import {RegisterCrudEvent} from "@drax/audit-back";



function InitializeAudit() {


    CrudEventEmitter.getInstance().on('crud:event', (data) => {
        console.log('New Audit Event:', data)

        RegisterCrudEvent(data)
            .then((Audit    ) => console.log('Audit Event registered successfully', Audit))
            .catch(e => console.error(e))
    })

    //Load All Permissions
}

export default InitializeAudit

export {InitializeAudit}

