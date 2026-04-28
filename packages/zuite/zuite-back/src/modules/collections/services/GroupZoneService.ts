
import type{IGroupZoneRepository} from "../interfaces/IGroupZoneRepository";
import type {IGroupZoneBase, IGroupZone} from "../interfaces/IGroupZone";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class GroupZoneService extends AbstractService<IGroupZone, IGroupZoneBase, IGroupZoneBase> {


    constructor(GroupZoneRepository: IGroupZoneRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(GroupZoneRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default GroupZoneService
export {GroupZoneService}
