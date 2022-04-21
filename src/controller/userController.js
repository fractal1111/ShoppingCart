
const userModel = require('../models/userModel')
const validator = require('../validator/validators')
const aws = require('../validator/awsS3')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

const register = async (req, res) => {
try {

    let requestBody = JSON.parse(JSON.stringify(req.body))
    
    console.log(requestBody)

    if (!validator.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: 'invalid Input Parameters' })
    }

    let {

      fname,
      lname,
      email,
      phone,
      password,
      address
      
    } = requestBody

    address = JSON.parse(address)

    let files = req.files
    let uploadedFileURL

    if (!validator.isValid(fname)) {
     
      return res
        .status(400)
        .send({ Status: false, Message: 'invalid First Name' })
    }

    if(!validator.isValidCharacters(fname.trim())) {
      return res
      .status(400)
      .send({Status:false , msg:"This attribute can only have letters as input"})
    }
    

    if (!validator.isValid(lname.trim())) {
      return res
        .status(400)
        .send({ Status: false, message: 'invalid last Name' })
    }

    if(!validator.isValidCharacters(lname)) {
      return res
      .status(400)
      .send({Status:false , msg:"This attribute can only have letters as input"})
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
    if (isEmailExist) {
      return res
        .status(400)
        .send({ status: false, message: `This email ${email} is Already In Use` })
    }

    if(!validator.isValid(phone)) {
      return res
      .status(400)
      .send({Status:false , message:"Please provide phone number"})

    }

    if (!validator.isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: 'Enter A valid phone Nummber' })

    }

    let isPhoneExist = await userModel.findOne({ phone })
    if (isPhoneExist) {
      return res
        .status(400)
        .send({ status: false, message: `This Phone ${phone} No. is Already In Use` })
    }

    if (!validator.isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: 'password Is Required' })
    }

    password = password.trim()

    if (!validator.isvalidPass(password)) {
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
        .send({ status: false, message: 'Shipping Street is required' })
    }

    if (!validator.isValid(address['shipping']['city'])) {
      return res
        .status(400)
        .send({ status: false, message: 'Shipping city is required' })

    }

    if (!validator.isValid(address['shipping']['pincode'])) {
      return res
        .status(400)
        .send({ status: false, message: 'Shipping Pincode is required' })
    }

    if (!validator.isValidPincode(parseInt(address['shipping']['pincode']))) {
      return res
        .status(400)
        .send({ status: false, message: 'Invalid pincode' })

    }

    if (!validator.isValid(address['billing']['street'])) {
      return res
        .status(400)
        .send({ status: false, message: 'Billing Street is required' })

    }

    if (!validator.isValid(address['billing']['city'])) {
      return res
      .status(400)
      .send({ status: false, message: 'Billing city is required' })

    }

    if (!validator.isValid(address['billing']['pincode'])) {
      return res
        .status(400)
        .send({ status: false, message: 'Billing Pincode is required' })
    }

    if (!validator.isValidPincode(parseInt(address['billing']['pincode']))) {
      return res
        .status(400)
        .send({ status: false, message: 'Invalid pincode' })

    }

    //UploadingFile..............................................................

    if (validator.isValidFiles(files)) {

        if (!validator.isValidImage(files[0])) {
          return res
            .status(400)
            .send({ status: false, message: `invalid image type` })

        }
      uploadedFileURL = await aws.uploadFile(files[0]);

    }
    else {
      return res
        .status(400)
        .send({ status: false, message: "Please provide a profile image" });
    }

    let finalData = {
      fname: fname,
      lname,
      email,
      profileImage: uploadedFileURL,
      phone,
      password: hashedPassword,
      address
    }

    const newUser = await userModel.create(finalData)
    return res
      .status(201)
      .send({ status: true, message: 'Success', Data: newUser })

} catch (error) {
    res
      .status(500)
      .send({ status: false, message: error.message })
}
}

module.exports.register = register

//..............................................................................

const useLogin = async function (req, res) {
try {

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "data required for login" })
    }

    let email = req.body.email
    let password = req.body.password

    if (!validator.isValid(email)) {
      return res.status(400).send({ status: false, message: "email is required" })
    }

    if (!validator.isValidEmail(email)) {
      return res.status(400).send({ Status: false, message: "please provide valid email id" })
    }


    if (!validator.isValid(password)) {
      return res.status(400).send({ status: false, message: "password is required" })
    }

  password = password.trim()
  
    let user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).send({ status: false, message: "email not found" })
    }


    let match = await bcrypt.compare(password, user.password)

    if (match) {//after decrypting

      let token = jwt.sign(
        { userId: user._id.toString()},
        "fifth project",
        { expiresIn: "30m" }
      )

      res.status(200).send({ status: true, data: { userId: user._id, token: token } })

    } else {
      return res.status(400).send({ Status: false, message: "Incorrect Password" })
    }
  }
  catch (err) {
    return res.status(500).send({ Status: false, message: err.message })

  }
}


const getUserById = async function (req, res) {
try {
    const userParams = req.params.userId.trim()

    //validating userId.

    if (!validator.isValidObjectId(userParams)) {
      return res
        .status(400)
        .send({ status: false, message: "Inavlid userId.Please enter a correct objectId" })
        
    }

    //finding user in db

    const findUser = await userModel.findOne({ _id: userParams })
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: `User ${userParams} does not exist.` })
    }


    if ((userParams == req.userId)) {    //Authorization

      return res
        .status(200)
        .send({ status: true, message: "granted", data: findUser })


    } else {
      return res
        .status(403)
        .send({ Status: false, message: "User not authorized to access requested id" })
    }

}catch (err) {
    return res
      .status(500)
      .send({ status: false, message: err.message })
}
}


//update profile


const updateProfile = async function (req, res) {
try {
    let userId = req.params.userId.trim()
  
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ Status: false, message: "Please enter valid user Id" })
    }

    let user = await userModel.findById(userId)
    if (!user) {
      return res
        .status(404)
        .send({ Staus: false, message: "User does not exist" })
    }

   
   
   //Authorization
  if (userId == req.userId) {

      const requestBody = JSON.parse(JSON.stringify(req.body))

      if (!validator.isValidRequestBody(requestBody)) {
      return res
          .status(400)
          .send({status: false, message: "Invalid request parameters. Please provide user details" });
      }

      const files = req.files;

      const {
        fname,
        lname,
        email,
        phone,
        password,
        address,  
      } = req.body


      filter = { address: user.address }

      // file validation
      if (validator.isValidFiles(files)) {

          if (!validator.isValidImage(files[0])) {
              return res
                .status(400)
                .send({ status: false, message: "file format should be image" })
          }

        let profileImage = await aws.uploadFile(files[0]);
        filter["profileImage"] = profileImage

      }


      // email validation
     if(requestBody.hasOwnProperty('email')) {

        if (!validator.isValid(email)) {
          return res
          .status(400)
          .send({status: false, message: `Please enter email`})
        }

        if (!validator.isValidEmail(email)) {
          return res
          .status(400)
          .send({status: false, message: `Email should be a valid email address`})
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email }) // {email: email} object shorthand property

        if (isEmailAlreadyUsed) {
          return res
          .status(400)
          .send({status: false, message: `${email} email address is already registered`});
        }

        filter["email"] = email

    }

      // phone validation
      if(requestBody.hasOwnProperty('phone')){

        if (!validator.isValid(phone)) {
          return  res
          .status(400)
          .send({ status: false, message: "Please enter phone nummber" })
        }
        
        
        if (!validator.isValidPhone(phone)) {
          return res
          .status(400)
          .send({ status: false, message: "Please use valid Indian phone nummber" })
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone });

        if (isPhoneAlreadyUsed) {
          return res
          .status(400)
          .send({ status: false, message: `${phone} is already registered` });
        }

        filter["phone"] = phone
      }



      // name validation
     
    if(requestBody.hasOwnProperty('fname')) {

        if (!validator.isValid(fname)) {
          return res
          .status(400)
          .send({status:false , message:"Please enter a name"})
        }

        if(!validator.isValidCharacters(fname)) {
          return res
          .status(400)
          .send({status:false , message:"This attribute can only have letters as input"})
        }
        
        filter['fname'] = fname
    }

     
     
    if(requestBody.hasOwnProperty('lname')){

        if (!validator.isValid(lname)) {
          return res
            .status(400)
            .send({status:false , message:"Please enter a last name"})
        }

        if(!validator.isValidCharacters(lname)) {
          return res
            .status(400)
            .send({status:false , message:"This attribute can only have letters as input"})
        }
          
      filter['lname'] = lname

    }


      //address 
    if(requestBody.hasOwnProperty('address')) {

      if(address.shipping != undefined) {
       
        if (validator.isValid(address.shipping.street)) {
          filter['address']['shipping']['street'] = address.shipping.street
        };


        if (validator.isValid(address.shipping.city)) {
          filter['address']['shipping']['city'] = address.shipping.city
        }


        if (validator.isValid(address.shipping.pincode)) {

          if (!validator.isValidPincode(parseInt(pincode))) {
            return res
              .status(400)
              .send({ status: false, message: "pincode attribute should be a number" });
          }

          filter['address']['shipping']['pincode'] = address.shipping.pincode

        }
        console.log(filter)
      
      }

      // address billing

      if(address.billing != undefined) {
       
        if (validator.isValid(address.billing.street)) {
            filter['address']['billing']['street'] = address.billing.street
        }

        if (validator.isValid(address.billing.city)) {
            filter['address']['billing']['city'] = address.billing.city
        }

        if (validator.isValid(address.billing.pincode)) {

          if (!validator.isValidPincode(parseInt(address.billing.pincode))) {
            return res
            .status(400)
            .send({ status: false, message: "pincode attribute should be a number" });
          }

          filter['address']['billing']['pincode'] = address.billing.pincode

        }
      
      }

    }

      // password
    if(requestBody.hasOwnProperty('password')) {

      if (!validator.isValid(password)) {
        return res
        .status(400)
        .send({ status:false , message : "Please enter new password" })
      }

      if (!validator.isvalidPass(password)) {
          return res
          .status(400)
          .send({ status: false, message: `Password length should be 8 - 15 characters`})
      }

      let hashedPassword = await validator.hashedPassword(password)
      filter['password'] = hashedPassword

    }



      //update
    let updatedProfile = await userModel.findOneAndUpdate({ _id: userId }, { $set: filter }, { new: true })
      return res
      .status(200)
      .send({ status: true, message: "Profile updated successfuly", data: updatedProfile })


  } else {
  return res
    .status(403)
    .send({ status: false, message: "User is not authorized to update requested profile" })
  }

}catch (err) {
  console.log(err)
  return res.status(500).send({ status: false, message: err.message })
}
}



module.exports.getUserById = getUserById;
module.exports.useLogin = useLogin
module.exports.updateProfile = updateProfile 