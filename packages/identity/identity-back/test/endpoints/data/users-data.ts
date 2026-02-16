import {IUserCreate} from "@drax/identity-share";

const USER1: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Wick",
    username: "johnwick",
    email: "johnwick@example.com"
}
const USER2: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Rambo",
    username: "rambo",
    email: "rambo@example.com"
}
const USER3: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Depp",
    username: "depp",
    email: "depp@example.com"
}

const USERS : IUserCreate[] = [USER1, USER2, USER3]

export {
    USER1,
    USER2,
    USER3,
    USERS
}
