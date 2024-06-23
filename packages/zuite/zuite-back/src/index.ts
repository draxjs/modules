import SetupDrax from './setup/SetupDrax.js'

await SetupDrax()

import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'
const serverYogaFastify = YogaFastifyServerFactory()
await serverYogaFastify.start(8082);
