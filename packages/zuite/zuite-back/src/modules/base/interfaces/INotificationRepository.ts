
import type {INotification, INotificationBase} from './INotification'
import {IDraxCrudRepository} from "@drax/crud-share";

interface INotificationRepository extends IDraxCrudRepository<INotification, INotificationBase, INotificationBase>{

}

export {INotificationRepository}


