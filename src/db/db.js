const mongoose = require("mongoose")


async function connectDB(){
   await mongoose.connect(process.env.DB_URI, {dbName:"socialdb"})
}

module.exports = connectDB