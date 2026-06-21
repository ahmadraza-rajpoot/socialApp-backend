const mongoose = require('mongoose')

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
    }


},{timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User;