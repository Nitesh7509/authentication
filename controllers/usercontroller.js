import userModel from "../models/usermodel.js"
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";


export async function register(req, res) {
    const { username, password, email } = req.body;
    const isloggedin = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (isloggedin) {
        return res.status(409).json({
            message: "email & username is already exits"
        })
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt)

    const user = await userModel.create({
        username,
        email,
        password: hashpassword
    })
    
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: "1d"
    })
     res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
       

    res.status(201).json({
        user,
       
       token
    })

}

export async function getme(req, res) {
    try {
       const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "token not found" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(401).json({
            message: "invalid token"
        });
    }
}