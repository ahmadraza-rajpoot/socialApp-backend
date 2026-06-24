const express = require('express')
const User = require('../models/user.model')
const {validateSignup} = require("../utils/validate")
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {auth} = require('../middlewares/auth.js')

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

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
            })
        }

        // find user
        const user = await User.findOne({email}).select("+password")
      
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        // compare hash password 
        const isValid = await bcrypt.compare(password, user.password)

        if(!isValid){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        // generate token and set it to cookie
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn:"7d"})
        
        res.cookie("token", token, {
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
    
        return res.status(200).json({
            success:true,
            message:"logged-in successfully"
        })

    }catch(error){
        console.log(error)

        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        })
    }

})

// get user profile
userRouter.get("/", auth, async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

module.exports = userRouter;