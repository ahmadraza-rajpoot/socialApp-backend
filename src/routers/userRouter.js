const express = require('express')
const User = require('../models/user.model')
const {validateFields} = require("../utils/validate")
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const validator = require("validator")
const jwt = require('jsonwebtoken')
const {auth} = require('../middlewares/auth.js')
const {randomInt} = require('crypto')
const {sendMail} = require('../services/sendMail.js')

// signup api
userRouter.post("/signup", async(req, res)=>{
    try {
        
        const firstName = req.body.firstName?.trim()
        const lastName = req.body.lastName?.trim()
        const email = req.body.email?.trim().toLowerCase()
        const password = req.body.password

        //validate data
        validateFields(firstName, lastName, email, password)

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

// login 
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
        const isValid = await user.validatePassword(password)
       
        if(!isValid){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        // generate token and set it to cookie
        const token = await user.getJWT()
      
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

//update user profile
userRouter.patch("/", auth, async(req, res) =>{
    try {

        const update = {}
      
        if(req.body.firstName){
            const firstName = req.body.firstName.trim()
            update["firstName"] = firstName
          
        }

        if(req.body.lastName){
            const lastName = req.body.lastName.trim()
            update["lastName"] = lastName
       
        }

        if(req.body.email){

            let email = req.body.email.trim().toLowerCase()
            if(!validator.isEmail(email)){
                return res.status(400).json({
                    success:false,
                    message:"Please provide valid email address"
                })
            }
            update["email"] = email
           
        }

        // if nothing update
        if(Object.keys(update).length == 0) {
            return res.status(400).json({success:false,message:"Provide valid field(s) for update"})
        }

        const {_id} = req.user
 
        const updatedUser = await User.findByIdAndUpdate(_id, update, {runValidators:true, returnDocument:"after"}).select("firstName lastName email")

        if(!updatedUser){
            return res.status(400).json({
                success:false,
                message:"Something went wrong."
            })
        }

        return res.status(200).json({
            success:true,
            message: `User has been updated`,
            data:updatedUser
            
        })

    } catch (error) {
        console.log(error)

        if(error.code === 11000){
            return res.status(409).json({
                success:false,
                message:"Email already exists"
            })
        }

        return res.status(500).json({
            success:false,
            message:"Something went wrong."  
        })
    }
})

// forgot password
userRouter.post("/forgot-password", async (req, res)=>{

    try {
        
        const {email} = req.body;

        if( !email || !validator.isEmail(email)){
            return res.status(401).json({
                success:false,
                message:"Please enter valid email"
            })
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const otp = randomInt(100000, 1000000);
      
        const hashedOTP = await bcrypt.hash(String(otp), 5);
         
        user.resetPasswordOtp = hashedOTP;
        user.otpExpires = Date.now() + 20 * 60 * 1000;

        await user.save()
        const html = `<h1>Here is your reset password OTP: <strong>${otp}</strong> </h1>`;
        const subject = "Forget Password Request";
        
        await sendMail(email, subject, html);

        req.email = email

        return res.status(200).json({
            success:true,
            message:"OTP has been sent"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            sucess:false,
            message:"Something went wrong."
        })
    }

})

userRouter.patch("/verify-otp", async(req, res)=>{
    try {
        const {otp, password, confirmPassword, email} = req.body;
        

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const isValidOtp = await bcrypt.compare(otp, user.resetPasswordOtp)
        
        if(!isValidOtp || user.otpExpires < Date.now()){
            return res.status(400).json({
                success:false,
                message:"Either OTP is incorrect or Expired"
            })
        }

        if(password != confirmPassword){
            return res.status(400).json(
                {
                    success:false,
                    message:"Password & confirm password are not matched"
                }
            )
        }

        const hashPassword = await bcrypt.hash(password, 10)

        user.password = hashPassword;
        user.resetPasswordOtp = null;
        user.otpExpires = null;
        await user.save()

        return res.status(200).json({
            success:true,
            message:"Your password has been changed"
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Something went wrong."
        })
    }
})

/*
  todo:
  1) forgot password
  2) delete user profile
*/
module.exports = userRouter;