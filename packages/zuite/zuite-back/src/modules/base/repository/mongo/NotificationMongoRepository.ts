
import {AbstractMongoRepository} from "@drax/crud-back";
import {NotificationModel} from "../../models/NotificationModel.js";
import type {INotificationRepository} from '../../interfaces/INotificationRepository'
import type {INotification, INotificationBase} from "../../interfaces/INotification";


class NotificationMongoRepository extends AbstractMongoRepository<INotification, INotificationBase, INotificationBase> implements INotificationRepository {

    constructor() {
        super();
        this._model = NotificationModel;
        this._searchFields = ['title', 'message', 'type', 'status'];
         this._populateFields = ['user'];
    }

}

export default NotificationMongoRepository
export {NotificationMongoRepository}

