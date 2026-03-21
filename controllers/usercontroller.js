import userModel from "../models/usermodel.js"
import bcrypt from "bcryptjs";

exports.register = async (req, res) => {
    const { username, password, email } = req.body;
    const isloggedin = userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if(isloggedin){
        res.status(409).json({
            message:"email & username is already exits"
        })
    }
    const salt = bcrypt.genSalt(10);
    const hashpassword = bcrypt.hash(password,salt)

    const user = userModel.create({
        username,
        email,
        password:hashpassword
    })
}