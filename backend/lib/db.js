
import mongoose from "mongoose"

export const connectDB = async (req,res) =>{
    try {
       const connect = await mongoose.connect(process.env.MONGODB_URI)
       console.log(`mongodb connected successfully: ${connect.connection.host}`)
    } catch (error) {
        console.log("error connecting to MONGODB", error.message)
        process.exit(1)
    }
}