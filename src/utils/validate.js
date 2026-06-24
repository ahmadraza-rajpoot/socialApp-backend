const validator = require('validator')

function validateSignup(firstName, lastName, email, password){
    
    if(!firstName) throw new Error("First name is required")
    if(!lastName) throw new Error("Last name is required")
    
    if(!email || !validator.isEmail(email)) throw new Error("Please enter valid emial")
    if(!password || !validator.isStrongPassword(password)) throw new Error("Please enter strong password")

}

module.exports = {
    validateSignup
}