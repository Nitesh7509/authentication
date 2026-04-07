import mongoose from "mongoose";

const userShema = new mongoose.Schema({
    username: String,
    email: String,
    password:String
})
let userModel = mongoose.model("users", userShema)
export default userModel;