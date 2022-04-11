
const userModel = require('../models/userModel')
const validator = require('../validator/validators')
const aws = require('../validator/awsS3')
const bcrypt = require('bcryptjs')

const register = async (req, res) => {
try {
    
    if (!validator.isValidRequestBody(req.body)) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid Input Parameters' })
    }

    let { fname, lname, email, phone, password, address } = req.body

    let files = req.files;
    let uploadedFileURL
    
    if (!validator.isValid(fname)) {
        return res
        .status(400)
        .send({ Status: false, Message: 'invalid First Name' })
    }

    if (!validator.isValid(lname)) {
        return res
        .status(400)
        .send({ Status: false, message: 'invalid last Name' })
    }

    if (!validator.isValid(email)) {
        return res
        .status(400)
        .send({ status: false, message: 'email is required' })
    }

    if (!validator.isValidEmail(email)) {
        return res
        .status(400)
        .send({ status: false, message: 'please enter a valid email' })
    }

    let isEmailExist = await userModel.findOne({ email })
        if(isEmailExist) {
        return res
        .status(400)
        .send({ status: false, message: `This email ${email} is Already In Use` })
    }

    if (!validator.isValidPhone(phone)) {
        return res
        .status(400)
        .send({ status: false, message: 'Enter A valid Mobile Nummber' })
    }

    let isPhoneExist = await userModel.findOne({ phone })
    if(isPhoneExist) {
        return res
        .status(400)
        .send({ status: false, message: `This Phone ${phone} No. is Already In Use`})
    }

    if (!validator.isValid(password)) {
        return res
        .status(400)
        .send({ status: false, message: 'password Is Required' })
    }

    if(!validator.isvalidPass) {
        return res
        .status(400)
        .send({ status: false, message: `password Should Be In Beetween 8-15 ` })
    }
    
    let hashedPassword = await validator.hashedPassword(password)
        console.log(hashedPassword.length)

    if (!address) {
        return res
        .status(400)
        .send({ status: false, message: 'address is required' })
    }

    if (!validator.isValid(address['shipping']['street'])) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid Shipping Street' })
    }

    if (!validator.isValid(address['shipping']['city'])) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid Shipping city' })
    }

    if (!validator.isValidPincode(parseInt(address['shipping']['pincode']))) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid Shipping Pincode' })
    }

    if (!validator.isValid(address['billing']['street'])) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid billing Street' })
    }

    if (!validator.isValid(address['billing']['city'])) {
        return res.status(400).send({ status: false, message: 'invalid billing city' })
    }

    if (!validator.isValidPincode(parseInt(address['billing']['pincode']))) {
        return res
        .status(400)
        .send({ status: false, message: 'invalid billing Pincode' })
    }

//UploadingFile..............................................................

    if (files && files.length > 0) {
        if(!validator.isValidImage(files[0])) {
            return res
            .status(400)
            .send({ status: false, message: `invalid image type` })
        }
        uploadedFileURL = await aws.uploadFile( files[0] );  
    } 
    else {
      return res
      .status(400)
      .send({ status: false, msg: "No file to write" });
    }

    let finalData = {
        fname,
        lname,
        email,
        profileImage : uploadedFileURL,
        phone,
        password: hashedPassword,
        address
    }

    const newUser = await userModel.create(finalData)
    return res
    .status(201)
    .send({ status: true, message: 'Success', Data:newUser })

} catch (error) {
    res
    .status(500)
    .send({ status: false, message: error.message })  
}
}

module.exports.register = register

//..............................................................................

const useLogin = async function(req, res){
try{
    let data = req.body
    if(!data){
        return res.status(400).send({status:false, msg:"data required for login"})
    }
    let email = req.body.email
    let password = req.body.password

    if(!isValid(email)){
        return res.status(400).send({status:false, msg:"email is requires"})
    }

    if(!isValid(password)){
        return res.status(400).send({status:false, msg:"password is required"})
    }

    let user = await userModel.findOne({email})

    if(!user){
        return res.status(404).send({status:false, msg:"email not found"})
    }

    let user1= await userModel.findOne({password})

    if(!user1){
        return res.status(404).send({status:false, msg:"password not found"})
    }

    let token= jwt.sign(
        {
            userId:user._id.toString(),
        },
        "fifth project",
        {
            expiresIn:"30m"
        }
    );
    res.setHeader("x-api-key", token)
    res.status(201).send({status:true, data:token})

    }catch(err){

    }
}


const getUserById = async function (req, res) {
try {
    const userParams = req.params.userId

    //validating userId.

    if (!isValid(userParams)) {
        return res
        .status(400)
        .send({ status: false, message: "Inavlid userId." })
    }

    //Finding the user in DB

const findUser = await userModel.findOne({ _id: userParams })
    if (!findUser) {
        return res
        .status(404)
        .send({ status: false, message: `User does not exist or is already been deleted for this ${userParams}.` })
        
    }else if (findUser.userId != req.userId) {     //Authorization
        return res
        .status(401)
        .send({ status: false, message: "Unauthorized access."})
    }
    else{
        return res
        .status(200)
        .send({status:true, msg:"granted", data:findUser})
    }

} catch (err) {
    return res
    .status(500)
    .send({ status: false, msg: err.message })
}
}



module.exports.getUserById = getUserById;
module.exports.useLogin=useLogin