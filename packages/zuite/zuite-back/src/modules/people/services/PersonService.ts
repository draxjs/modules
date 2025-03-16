
import type{IPersonRepository} from "../interfaces/IPersonRepository";
import type {IPersonBase, IPerson} from "../interfaces/IPerson";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PersonService extends AbstractService<IPerson, IPersonBase, IPersonBase> {

    constructor(PersonRepository: IPersonRepository, schema?: ZodObject<ZodRawShape>) {
        super(PersonRepository, schema);
    }

}

export default PersonService
export {PersonService}
