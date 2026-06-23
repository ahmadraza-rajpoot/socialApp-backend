const express = require('express')
const User = require('../models/user.model')
const {signUpValidator} = require("../utils/validate")
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

userRouter.post('/signup', async (req, res)=>{
    try {
        signUpValidator(req)

        const {firstName, lastName, email, password} = req.body
        
        const hasPassword = await bcrypt.hash(password, 10)
        
        const user = await User.create({firstName, lastName, email, password:hasPassword})
        
        
        res.status(201).json({
            success:true,
            message:"user have been created",
            data:{firstName:user.firstName, lastName: user.lastName, email:user.email},
        })

    } catch (error) {
        res.status(500).json(
            {
                success:false,
                message: process.env.NODE_ENV === "development"?error.message:"Something went wrong."
            }
        )
    }
})

userRouter.post('/login', async (req, res)=>{
    try {
        const {email, password} = req.body

        const user = await User.findOne({email}).select("+password")
        
        if(!user || !(await bcrypt.compare(password, user.password))){
           return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        } 

        
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET, {expiresIn:"7d"})
      
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        
        res.status(200).json({
            success:true,
            message:"logged in successfully"
        })    
    } catch (error) {
        res.status(401).json({
            success:false,
            message:process.env.NODE_ENV == "development"? error.message:"Something went wrong."
        })
    }
})

userRouter.get("/", async (req, res)=>{
    
    try {
        const {token} = req.cookies

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Please login'
            })
        }

        const {_id} = jwt.verify(token,process.env.JWT_SECRET)
        
        const user = await User.findById(_id).lean()

        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        
        return res.status(200).json({
            success:true,
            data:user,
        
        })

    } catch (error) {
        console.error(error)
       return res.status(401).json({
            
            success:false,
            message: "Invalid or expired token"
        })
    }

} )


module.exports = userRouter;