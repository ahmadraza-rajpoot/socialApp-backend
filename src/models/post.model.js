const mongoose = require("mongoose")

const postModel = new mongoose.Schema({
    caption:{
        type:String,
        require:true,
        maxLength:1000,
        minLength:3,
    },
    image:{
        type:String,
        require,
    }
}, {timestamps:true})


const Post = mongoose.model("Post", postModel)

module.exports = Post