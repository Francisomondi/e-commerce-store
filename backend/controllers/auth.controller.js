import redis from "../lib/redis.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateTokens = (user)=>{
    const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({id: user._id }, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "7d"
    })
     return { accessToken, refreshToken };
} 
   
const storeRefreshToken = async(id,refreshToken) =>{
    await redis.set(`refresh_token:${id}`, refreshToken,"EX", 7*24*60*60)
}

const setCookies = (accessToken,refreshToken,res)=>{
    res.cookie("access_token", accessToken, {
        httpOnly: true, //accessible only by web server
        secure: process.env.NODE_ENV === "production", //   https
        sameSite: "strict", //cross-site request forgery
        maxAge: 15*60*1000 //15 minutes
    })
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: process.env.NODE_ENV === "production", //https
        sameSite: "strict", //cross-site request forgery
        maxAge: 7*24*60*60 //7 days
    })
}
export const signup = async (req,res)=>{

    const {email,password,name} = req.body
    try {
        const userExist = await User.findOne({email})

        if(userExist){
        return res.status(400).json({message: "User already exist"})
        }

     const user = await User.create({email,password,name})

     //authenitcate user
    const{accessToken,refreshToken} = generateTokens(user._id)
    await storeRefreshToken(user._id, refreshToken)

    setCookies(accessToken,refreshToken,res)
   
     res.status(201).json({user:{
         email:user.email,
         name:user.name,
         _id:user._id,
        role:user.role
     }, message: "User created successfully"})

    } catch (error) {
        res.status(500).json({message: error.message})  
    }
   
}

export const login = async (req,res)=>{
  
   try {
    const {email,password} = req.body
    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({message: "User does not exist"})
    }
    (user && await user.comparePassword(password))

    const{accessToken,refreshToken} = generateTokens(user._id)
    await storeRefreshToken(user._id, refreshToken)

    setCookies(accessToken,refreshToken,res)    
    res.status(200).json({user:{
        email:user.email,
        name:user.name,
        _id:user._id,
        role:user.role
    }},
)
console.log(`${user.name} logged in successfully`)
}catch(error){
    console.log("error logging in", error.message)
    res.status(500).json({message: error.message})
}
}

export const logout = async (req,res)=>{
    try {
        const refreshToken = req.cookies?.refresh_token

        if(refreshToken) {
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            } catch (error) {
                return res.sendStatus(403)
            }
              // Clear from Redis
             await redis.del(`refresh_token:${decoded.id}`);
        }
        res.clearCookie("refresh_token");
        res.clearCookie("access_token");
        return res.status(200).json({message: "Logout successful"})
    } catch (error) {
        console.log("error logging out", error.message)
        res.status(500).json({message: "Logout failed", error: error.message})
    }

   
}

