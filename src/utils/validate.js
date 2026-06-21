const validator = require("validator");

function signUpValidator(req) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName?.trim()) {
        throw new Error("First name is required");
    }

    if (!lastName?.trim()) {
        throw new Error("Last name is required");
    }

    if (!email) {
        throw new Error("Email is required");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Please enter a valid email");
    }

    if (!password) {
        throw new Error("Password is required");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong enough");
    }
}

module.exports = {
    signUpValidator
}