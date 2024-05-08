import {mongoose} from "@drax/common-back"
import {IRole} from "../../../src/interfaces/IRole"

const role: IRole = {
  _id: new mongoose.Types.ObjectId("646a661e44c93567c23d8d62"),
  name: "Admin",
  permissions: [],
  childRoles: [],
  readonly: false
}

export default role
