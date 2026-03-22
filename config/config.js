import dotenv from "dotenv"
dotenv.config()
if(!process.env.MONGODB){
 throw new Error("mongodb url is not found");
 }
if(!process.env.JWT_SECRET){
 throw new Error(" jwt sceret url is not found");
 }
let config ={
    MONGODB : process.env.MONGODB,
    JWT_SECRET : process.env.JWT_SECRET
}

export default config ;