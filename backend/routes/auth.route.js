import express from "express"

const router = express.Router()

router.get("/signup", (req,res)=>{
    res.send("this is the signup route")
})

router.get("/login", (req,res)=>{
    res.send("this is the login route")
})

router.get("/logout", (req,res)=>{
    res.send("this is the logout route")
})

export default router