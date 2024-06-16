import {IUser} from "../../../src/interfaces/IUser"
import {randomUUID} from "node:crypto";
import role from "../roles/admin-sqlite-role";

const user = {
  id: '539f51a6-5d40-4ef2-85c4-c580f042f422',
  active: false,
  groups: [],
  username:  "root",
  email: "root@example.com",
  password: "123",
  name: "root",
  phone: "123456789",
  avatar: "asd",
  role: role.id,
  toObject(): IUser {
    return this;
  }
};

export default user
