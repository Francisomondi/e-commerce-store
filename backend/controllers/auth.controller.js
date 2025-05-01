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
   
const storeRefreshToken = async(userId,refreshToken) =>{
    await redis.set(`refresh_token: ${userId}`, refreshToken,"EX", 7*24*60*60)
}

const setCookies = (accessToken,refreshToken,res)=>{
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15*60*1000
    })
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60
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
    res.send("this is the login route")
}
export const logout = async (req,res)=>{
    res.send("this is the logout route")
}

