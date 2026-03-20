import dotenv from "dotenv"
dotenv.config()
if(!process.env.MONGODB){
 throw new Error("mongodb url is not found");
 
}
let config ={
    MONGODB : process.env.MONGODB
}

export default config ;