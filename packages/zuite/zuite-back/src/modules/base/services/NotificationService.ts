
import type{INotificationRepository} from "../interfaces/INotificationRepository";
import type {INotificationBase, INotification} from "../interfaces/INotification";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class NotificationService extends AbstractService<INotification, INotificationBase, INotificationBase> {


    constructor(NotificationRepository: INotificationRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(NotificationRepository, baseSchema, fullSchema);

        this._validateOutput = false

    }

}

export default NotificationService
export {NotificationService}
