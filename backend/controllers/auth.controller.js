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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const{accessToken,refreshToken} = generateTokens(user._id)
    await storeRefreshToken(user._id, refreshToken)

    setCookies(accessToken,refreshToken,res)    
    res.status(200).json({user:{
        email:user.email,
        name:user.name,
        _id:user._id,
        role:user.role
    }, message: "User loged in successfully"},
    
)

}catch(error){
  
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
       
        console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }

   
}

export const refreshToken = async(req,res)=>{
    try {
        const refreshToken = req.cookies?.refresh_token

        if(!refreshToken) {
             return res.status(401).json({message: "no refresh token"})
        }    
           
             
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            
             //
            const storedRefreshToken =  await redis.get(`refresh_token:${decoded.id}`); 
            if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
             return res.status(403).json({message: "invalid refresh token!"})
            }
            const accessToken = jwt.sign({id: decoded.id}, process.env.ACCESS_TOKEN_SECRET, {
             expiresIn: "15m"
            })
            res.cookie("access_token", accessToken, {
             httpOnly: true,
             secure: process.env.NODE_ENV === "production",
             sameSite: "strict",
             maxAge: 15*60*1000      
            })
            return res.status(200).json({message: "Token refreshed successfully"})
        }
     catch (error) {
        res.status(500).json({message: "Refresh token failed", error: error.message})
    }
}

export const getProfile = async (req, res) => {
	try {
		await res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};