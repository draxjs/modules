//CRUD
import AbstractMongoRepository from "./repository/AbstractMongoRepository.js";
import AbstractSqliteRepository from "./repository/AbstractSqliteRepository.js";
import AbstractService from "./services/AbstractService.js";
import AbstractFastifyController from "./controllers/AbstractFastifyController.js";

import type {ICrudRepository} from "./interfaces/ICrudRepository";

export type {ICrudRepository}

export {

    //CRUD
    AbstractMongoRepository,
    AbstractSqliteRepository,
    AbstractService,
    AbstractFastifyController,

}
