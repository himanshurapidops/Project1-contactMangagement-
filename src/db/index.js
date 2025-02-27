import mongoose from "mongoose";

const connectDB = async ()=>{
    try {

      const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URI}`)

        console.log(`\n MongoDB connected!!! DB HOST : ${connectionInstance.connection.host}`)

          //console.log(connectionInstance)
    }catch(error){

        console.log("MONGODB connection FAILED : ", error);
        process.exit(1); // research in node

    }
}   


export default connectDB