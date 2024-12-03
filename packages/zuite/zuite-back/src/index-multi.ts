import path from "path";
import {fileURLToPath} from "url";
import MongoDb from './databases/MongoDB'
import ApolloExpressServerFactory from './factories/ApolloExpressServerFactory'
import ApolloFastifyServerFactory from './factories/ApolloFastifyServerFactory'
import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory'

MongoDb()
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

const serverApolloExpress = ApolloExpressServerFactory(ROOT_DIR)
await serverApolloExpress.start(8082);


const serverApolloFastify = ApolloFastifyServerFactory(ROOT_DIR)
await serverApolloFastify.start(8083);


const serverYogaFastify = YogaFastifyServerFactory(ROOT_DIR)
await serverYogaFastify.start(8085);
