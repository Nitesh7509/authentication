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
    return res.status(401).json({
      message: "email & username is already exits",
    });
  }
  const hashpassword = await bcrypt.hash(password, 10);

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
  const refreshtokenhash = await bcrypt.hash(refreshtoken, 10);

  const sessiontime = await sessionmodel.create({
    user: user._id,
    refreshtokenhash: refreshtokenhash,
    ip: req.ip,
    useragent: req.headers["user-agent"],
  });
  const accesstoken = jwt.sign(
    {
      id: user._id,
      sessiontimeid: sessiontime._id,
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

  res.status(201).json({
    user,
    accesstoken,
  });
}
export async function login(req, res) {
  const { username, password, email } = req.body;
  const users = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (!users) {
    return res.status(401).json({
      message: "email & username is not exits",
    });
  }
  const comparepassword = await bcrypt.compare(password,users.password);
  if(!comparepassword){
     return res.status(401).json({
      message: "email & username & password is not exits",
    })
  }



  const refreshtoken = jwt.sign(
    {
      id: users.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  const refreshtokenhash = await bcrypt.hash(refreshtoken, 10);

  const sessiontime = await sessionmodel.create({
    user: users.id,
    refreshtokenhash: refreshtokenhash,
    ip: req.ip,
    useragent: req.headers["user-agent"],
  });
  const accesstoken = jwt.sign(
    {
      id: users.id,
      sessiontimeid: sessiontime._id,
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

  res.status(201).json({
    users,
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

    const session = await sessionmodel.findOne({ user: decoded.id });

    if (!session) {
      return res.status(401).json({ message: "Session not found" });
    }

    const isMatch = await bcrypt.compare(
      refreshtoken,
      session.refreshtokenhash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accesstoken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newrefreshtoken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const newrefreshtokenhash = await bcrypt.hash(newrefreshtoken, 10);

    session.refreshtokenhash = newrefreshtokenhash;
    await session.save();

    res.cookie("refreshtoken", newrefreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accesstoken });
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
}
export async function logout(req, res) {
  try {
    const refreshtoken = req.cookies.refreshtoken;
    const decoded = jwt.verify(refreshtoken, config.JWT_SECRET);
    

    const session = await sessionmodel.findOne({
       user: decoded.id ,
       revoke: false,
    });

    session.revoke = true;
    await session.save();
    res.clearCookie("refreshtoken");
    res.status(201).json({
      message: "logout succesful",
    });
  } catch (error) {
    res.status(401).json({
      message: "invalid token",
    });
  }
}
