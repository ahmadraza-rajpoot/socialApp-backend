const express = require('express')
const User = require('../models/user.model')
const {validateSignup} = require("../utils/validate")
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// signup api
userRouter.post("/signup", async(req, res)=>{
    try {
        
        const firstName = req.body.firstName?.trim()
        const lastName = req.body.lastName?.trim()
        const email = req.body.email?.trim().toLowerCase()
        const password = req.body.password

        //validate data
        validateSignup(firstName, lastName, email, password)

        // generate has password
        const hashPassword = await bcrypt.hash(password,10)

        // create user in db
        const user = await User.create({firstName, lastName, email, password:hashPassword})
        
        // send back response
        return res.status(201).json({
            success:true,
            message:"user has been created",
            data:{firstName:user.firstName, lastName:user.lastName, email:user.email}
        })
    } catch (error) {

        console.error(error)

        if(error?.code == 11000){
            return res.status(409).json({
                success:false,
                message:"Email already exists"
            })
        }

        return res.status(500).json({
            success:false,
            message: "Something went wrong."
        })
    }
})

// login api
userRouter.post("/login", async(req, res)=>{
    try{

        // extract data
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        // find user
        const user = await User.findOne({email}).select("+password")
      
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        // compare hash password 
        const isValid = await bcrypt.compare(password, user.password,)

        if(!isValid){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        // generate token and set it to cookie
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        res.cookie("token", token)
    
        return res.status(200).json({
            success:true,
            message:"logged-in successfully"
        })

    }catch(error){
        console.log(error)

        return res.status(400).json({
            success:false,
            message:"Something went wrong"
        })
    }

})

// get user profile
userRouter.get("/", async(req, res)=>{
    try{

        
        const {token} = req.cookies

        if(!token){
            return res.status(401).json({
                sucess:false,
                message:"Please logged-in again"
            })
        }

        const decodedId = await jwt.verify(token, process.env.JWT_SECRET)

        if(!decodedId){
            return res.status(401).json({
                success:false,
                message:"Invalid or expired token, please login again"
            })
        }

        const {_id} = decodedId;

        const user = await User.findById(_id)

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }


        return res.status(200).json({
            success:true,
            data:user
        })


    }catch(error){
        console.log(error)

        return res.status(401).json({
            success:false,
            message:"Something went wrong"
        })
    }
})

module.exports = userRouter;