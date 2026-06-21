const express = require('express')
const User = require('../models/user.model')
const {signUpValidator} = require("../utils/validate")
const userRouter = express.Router()
const bcrypt = require('bcrypt')

userRouter.post('/', async (req, res)=>{
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
                message: process.env.MODE === "development"?error.message:"Something went wrong."
            }
        )
    }
})

userRouter.post('/login', async (req, res)=>{
    try {
        const {email, password} = req.body

        const user = await User.findOne({email}).select("+password")

        if(!user) throw new Error("Email or password is not correct")

     
        const isValid = await bcrypt.compare(password, user.password)

        if(!isValid) throw new Error("Email or password is not correct")
        
        res.status(200).json({
            success:true,
            message:"logged in successfully"
        })    
    } catch (error) {
        res.status(404).json({
            success:false,
            message:process.env.MODE == "development"? error.message:"Something went wrong."
        })
    }
})


module.exports = userRouter;