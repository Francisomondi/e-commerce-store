import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectedRoute = async (req, res, next) => {
    try {

        const accessToken = req.cookies?.access_token
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - no access token found" })
            
        }

       try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
       const user =await User.findById(decoded.id).select('-password')

       if(!user){
        return res.status(401).json({message: "Unauthorized - user not found"})
       }

       req.user = user
        next()
       } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized - access token expired" })
        } else {
            throw error
            
        }
       }
    } catch (error) {
        console.log("error in protected route middleware", error.message)
        res.status(401).json({ message: "Unauthorized" })
    }
       
} 

export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    }else{
        return res.status(403).json({ message: "Unauthorized - admin only" })
    }
    
}