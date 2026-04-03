import { Router } from "express";
import {
  getme,
  logout,
  refreshtoken,
  register,
} from "../controllers/usercontroller.js";

const router = Router();

router.post("/register", register);
router.get("/getme", getme);
router.get("/refreshtoken", refreshtoken);
router.get("/logout", logout);

export default router;
