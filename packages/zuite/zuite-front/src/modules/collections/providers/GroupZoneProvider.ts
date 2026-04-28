
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IGroupZone, IGroupZoneBase} from '../interfaces/IGroupZone'

class GroupZoneProvider extends AbstractCrudRestProvider<IGroupZone, IGroupZoneBase, IGroupZoneBase> {
    
  static singleton: GroupZoneProvider
    
  constructor() {
   super('/api/group-zones')
  }
  
  static get instance() {
    if(!GroupZoneProvider.singleton){
      GroupZoneProvider.singleton = new GroupZoneProvider()
    }
    return GroupZoneProvider.singleton
  }

}

export default GroupZoneProvider

