import User from "../models/user.model.js"

export const signup = async (req,res)=>{

    const {email,password,name} = req.body
    try {
        const userExist = await User.findOne({email})

    if(userExist){
        return res.status(400).json({message: "User already exist"})
    }
   const user = await User.create({email,password,name})
   res.status(201).json({user}) 
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

