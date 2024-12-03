import path from "path";
import {fileURLToPath} from "url";

import SetupDrax from './setup/SetupDrax.js'
await SetupDrax()

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
console.log("ROOT_DIR",ROOT_DIR)
import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'

const serverYogaFastify = YogaFastifyServerFactory(ROOT_DIR)
await serverYogaFastify.start(8082);


