import {mongoose} from "@drax/common-back"
import {IUser} from "../../../src/interfaces/IUser"

const user = {
  _id: new mongoose.Types.ObjectId("646a661e44c93567c23d8d61"),
  active: false,
  groups: [],
  username:  "root",
  email: "root@example.com",
  password: "12345678",
  name: "root",
  phone: "123456789",
  role: new mongoose.Types.ObjectId("646a661e44c93567c23d8d62"),
  toObject(): IUser {
    return this;
  }
};

export default user
