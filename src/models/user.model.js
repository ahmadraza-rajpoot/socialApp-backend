const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        minLength:3,
        maxLength:10,
        require:true,
    },

    lastName:{
        type:String,
        minLength:3,
        maxLength:10,
        require:true,
    },

    email:{
        type:String,
        require:true,
        unique:true
    },

    password:{
        type:String,
        minLength:8,
        maxLength:100,
        require:true,
        select:false
    },

    resetPasswordOtp:{
        type:String,
        default:null,
    },
    otpExpires:{
        type: Date,
        default:null,
    }


},{timestamps:true})

userSchema.methods.validatePassword = async function(plainPassword){
    const user = this;
    const hashPassword = user.password;

    const isValidPassword = await bcrypt.compare(plainPassword, hashPassword)

    return isValidPassword
}

userSchema.methods.getJWT = async function(){
    const user = this;
    

    const token = await jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:"7d"});

    return token;
}

const User = mongoose.model("User",userSchema)

module.exports = User;