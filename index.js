import app from "./src/app.js"
import connected from "./config/database.js";
connected()

app.listen(3000,()=>{
    console.log("server connected successful");
    })