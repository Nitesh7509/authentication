import userModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import sessionmodel from "../models/sessionmodel.js";


export async function register(req, res) {
  const { username, password, email } = req.body;
  const isloggedin = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isloggedin) {
    return res.status(409).json({
      message: "email & username is already exits",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(password, salt);


  const user = await userModel.create({
    username,
    email,
    password: hashpassword,
  });

  const refreshtoken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  const refreshtokenhash= await bcrypt.hash(refreshtoken, salt);

  const sessiontime = await sessionmodel.create({
    user:user._id,
    refreshtokenhash:refreshtokenhash,
    ip:req.ip,
    useragent:req.headers["user-agent"]
  })
  const accesstoken = jwt.sign(
    {
      id: user._id,
      sessiontimeid:sessiontime._id
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.clearCookie("token");

  res.status(201).json({
    user,
    accesstoken,
  });
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
      user,
    });
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
}

export async function refreshtoken(req, res) {
  try {
    const refreshtoken = req.cookies.refreshtoken;

    if (!refreshtoken) {
      return res.status(401).json({ message: "refreshtoken not found" });
    }

    const decoded = jwt.verify(refreshtoken, config.JWT_SECRET);
    const accesstoken = jwt.sign(
      {
        id: decoded._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const newrefreshtoken = jwt.sign(
      {
        id: decoded._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    res.cookie("refreshtoken", newrefreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accesstoken,
    });
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
}
export async function logout(req, res) {
  try {
  const refreshtoken = req.cookies
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
}
