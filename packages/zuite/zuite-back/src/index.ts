import MongoDb from './databases/MongoDB.js'
import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'

MongoDb()

const serverYogaFastify = YogaFastifyServerFactory()
await serverYogaFastify.start(8082);
