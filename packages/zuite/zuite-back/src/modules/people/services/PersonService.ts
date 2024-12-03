
import type{IPersonRepository} from "../interfaces/IPersonRepository";
import type {IPersonBase, IPerson} from "../interfaces/IPerson";
import {AbstractService} from "@drax/crud-back";
import {ZodSchema} from "zod";

class PersonService extends AbstractService<IPerson, IPersonBase, IPersonBase> {

    constructor(PersonRepository: IPersonRepository, schema?: ZodSchema) {
        super(PersonRepository, schema);
    }

}

export default PersonService
export {PersonService}
