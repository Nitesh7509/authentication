import { Router } from "express";
import { getme, register } from "../controllers/usercontroller.js"

const router = Router()

router.post("/register",register)
router.get("/getme",getme)



export default router