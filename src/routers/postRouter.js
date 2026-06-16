const express = require("express")
const Post = require("../models/post.model")

const postRouter = express.Router()

postRouter.post("/", async(req, res)=>{
    try {
        
        let {caption, image} = req.body

        const post =  new Post({caption, image})
        const savedPost = await post.save()

        res.status(201).json({
            success:true,
            message:"post has been created",
            data:savedPost
        })

    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
})

module.exports = postRouter