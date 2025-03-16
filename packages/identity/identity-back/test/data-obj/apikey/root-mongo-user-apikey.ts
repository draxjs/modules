import user from "../users/root-mongo-user"

const userApiKey = {
  _id: "646a661e44c93567c23d8c22",
  name: "root",
  secret: "123",
  user: user._id,
  createdBy: user._id
};

export default userApiKey
