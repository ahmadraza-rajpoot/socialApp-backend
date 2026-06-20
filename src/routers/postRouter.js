const express = require("express")
const Post = require("../models/post.model")
const multer  = require('multer')
const upload = multer({
    storage:multer.memoryStorage()
})

const postRouter = express.Router()
const imageKit = require('../services/imageKit')

postRouter.get("/", async(req, res)=>{
    try{
        const posts = await Post.find({}).lean()

        res.status(200).json({
            success:true,
            data:posts
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error."
        })
    }

})


postRouter.post("/", upload.single('image') ,async(req, res)=>{
    try {
        
        let {caption} = req.body
        let image = req.file
  
        if(!caption || !image){
           return res.status(400).json({
                success:false,
                message:"caption and image are required",
            })
        }


      const response =  await imageKit.files.upload({
            file:image.buffer.toString("base64"),
            fileName: image.originalname
        })

       
        if(response.url == undefined) throw new Error("file upload failed")
      
        const post =  new Post({caption, image:response.url})
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

postRouter.delete("/:id", async (req, res)=>{
    try{
    const {id} = req.params

    const result = await Post.findOneAndDelete({_id:id}).select("_id")
    
    if(!result){
        return res.status(400).json({
            success:false,
            message:"No result found"
        })
    }

    res.status(200).json({
        success:true,
        message:"post has been deleted",
        data:result
    })

    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }

})

module.exports = postRouter