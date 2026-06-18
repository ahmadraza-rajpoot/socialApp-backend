const express = require("express")
require("dotenv").config()
const connectDB = require('./db/db')
const postRouter = require('./routers/postRouter')

const app = express()


const PORT = process.env.PORT

app.use(express.json())
app.use('/api/post',postRouter)


app.get("/", async(req, res)=>{

    try{

        res.status(200).json({
            success:true,
            message:"server is working.."
        })

    }catch(error){
        res.status(400).json({
            success:false,
            message:`Something went wrong.. Error: ${error.message}`
        })
    }

    
})

connectDB().then(()=>{

    console.log("db has been connected!")

    app.listen(PORT, ()=>{
    console.log("Server is running on port: " + PORT)
    })
}).catch((error)=>{
    console.log(error.message)
})

