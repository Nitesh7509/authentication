import { Router } from "express";
import {
  getme,
  login,
  logout,
  refreshtoken,
  register,
} from "../controllers/usercontroller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getme", getme);
router.post("/refreshtoken", refreshtoken);
router.get("/logout", logout);

export default router;
