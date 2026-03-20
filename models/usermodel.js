import mongoose from "mongoose";

const userShema = new mongoose.Schema({
    username: String,
    age: Number,
    email: String
})
let userModel = mongoose.model("users", userShema)
export default userModel;