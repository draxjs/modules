import {mongoose} from "@drax/common-back"
import {IUser} from "../../../src/interfaces/IUser"

const user: IUser = {
  _id: new mongoose.Types.ObjectId("646a661e44c93567c23d8d61"),
  active: false,
  groups: [],
  username:  "root",
  email: "root@example.com",
  password: "123",
  name: "root",
  role: new mongoose.Types.ObjectId("646a661e44c93567c23d8d62")
}

export default user
