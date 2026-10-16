import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("mongodb connected")
    } catch (error) {
        console.log(`db error ${error}`)
    }
}

export default connectDb