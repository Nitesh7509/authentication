import mongoose  from "mongoose";
import config from "./config.js";

async function connected (){
try {
    await mongoose.connect(config.MONGODB)
    console.log("database connected successfull");
    
} catch (error) {
    console.log(error);
    
}
 
}
export default connected ;