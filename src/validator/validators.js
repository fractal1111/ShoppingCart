const bcrypt = require("bcryptjs/dist/bcrypt")
const mongoose = require("mongoose")

const isValid = (value) => {

    if (typeof value != 'string') return false
    if (typeof value === 'undefined' || typeof value === null) { return false }

    if (typeof value === 'string' && value.trim().length == 0) { return false }

    return true
}

const isValidRequestBody = (body) => {
    return (Object.keys(body).length > 0)

}



const isValidEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

const isValidPincode = (pincode) => {
    return /^[1-9][0-9]{5}$/.test(pincode);
}

const isValidPhone = (phone) => {
    return (/^[6-9]\d{9}$/.test(phone))
}

const hashedPassword = async (password) => {
    let p1 = await bcrypt.hash(password, 10)
    return p1
}

const isValidImage = (image) => {
    if (/.*\.(jpeg|jpg|png)$/.test(image.originalname)) {
        return true
    }
    return false
}

const isvalidPass = (password) => {
    if (password.length > 15 || password.length < 8) { return false }
    return true

}

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidNumber = function (value) {
    return (!isNaN(value) && value > 0)
}

const isValidBoolean = (value) => {
    return (value === 'true' || value === 'false')
}

const isValidSize = (Arr) => {
    let newArr = []
    if (!Arr.length > 0)
        return false

    for (let i = 0; i < Arr.length; i++) {
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(Arr[i].toUpperCase())) {
            return false
        }
        newArr.push(Arr[i].toUpperCase())
    }
    return newArr
}



const isValidCharacters = (value) => {
    return /^[A-Za-z]+$/.test(value)
}

module.exports = {
    
    isValid,
    isValidEmail,
    isValidPincode,
    isValidRequestBody,
    isValidPhone,
    hashedPassword,
    isvalidPass,
    isValidImage,
    isValidObjectId,
    isValidNumber,
    isValidBoolean,
    isValidSize,
    isValidCharacters
}
