import mongoose from "mongoose";

const session = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  refreshtokenhash: {
    type: String,
    require: true,
  },
  revoke:{
    type:Boolean,
    default:false
  },
  ip:{
     type: String,
    require: true,
  },
  useragent:{
     type: String,
    require: true,
  }
},{
timestamps:true
});

const sessionmodel = mongoose.model("session",session)
export default sessionmodel
