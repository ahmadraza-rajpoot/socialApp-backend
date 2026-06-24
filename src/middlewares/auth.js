const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

async function auth(req, res, next){
    try{
        const {token} = req.cookies

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Invalid token, please logged-in agian."
            })
        }

        const decodedId =  jwt.verify(token, process.env.JWT_SECRET)
        const {_id} = decodedId

        const user = await User.findById(_id)

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found, please login-in again."
            })
        }

        req.user = user

        next()

    }catch(error){
        console.log(error)

        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        })
    }   
}

module.exports = {
    auth
}