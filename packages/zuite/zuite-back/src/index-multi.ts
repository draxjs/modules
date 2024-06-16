
import MongoDb from './databases/MongoDB.js'
import ApolloExpressServerFactory from './factories/ApolloExpressServerFactory.js'
import ApolloFastifyServerFactory from './factories/ApolloFastifyServerFactory.js'
import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'

MongoDb()


const serverApolloExpress = ApolloExpressServerFactory()
await serverApolloExpress.start(8082);


const serverApolloFastify = ApolloFastifyServerFactory()
await serverApolloFastify.start(8083);


const serverYogaFastify = YogaFastifyServerFactory()
await serverYogaFastify.start(8085);
