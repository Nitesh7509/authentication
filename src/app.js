import express from "express"
import morgan from "morgan"
import router from "../routes/userroutes.js"
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))

app.use("/api",router)
app.use("*name",(req,res)=>{
 res.status(404).send("route not found ")
})


app.get("/", (req,res,next)=>{
res.send("hello")
})

export default app;