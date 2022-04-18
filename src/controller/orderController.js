const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const validators = require('../validator/validators')
const orderModel = require('../models/orderModel')

const createOrder = async (req, res) => {
     
    if(!req.params.hasOwnProperty('userId')) {
        return res.status(400).send({ status: false, nessage: `please Provide User Id In params` })
    }
    if(Object.keys(req.params).length > 1) {
        return res.status(400).send({ status: false, Message: `Invalid request params` })
    }
    
    
    userId = req.params.userId
    if(!validators.isValidObjectId(userId)) {
        return res
        .status(400)
        .send({ status: false, Message: `${userId} is Not A Valid User Id`})
    }

    const isUserExist = await userModel.findById(userId)
    if(!isUserExist) {
        return res.status(404).send({ status: false, Message: `userNot Found Please Check User Id` })
    }

    ///authorization
    
    if(!validators.isValidRequestBody(req.body)) {
        return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
    }

    let {items, totalPrice, totalItems, totalQuantity} = req.body

    if(!req.body.hasOwnProperty('items')) {
        return res
        .status(400)
        .send({ status: false, Message: `Items Should Be present in request body` })
    }

    if(!Array.isArray(items) || items.length == 0) {  
        return res  
        .status(400)
        .send({ status: false, message : ` invalid input - Items. must be an array` })
    }

    if(!req.body.hasOwnProperty('totalPrice')) {
        return res
        .status(400)
        .send({ status: false, Message: `total Price Should Be Presemt In Request Body` })
    }

    if ( !validators.isValidNumber(totalPrice) ) {
        return res
        .status(400)
        .send({ status: false, Message: `Total Price Should Be A Number` })
    }

    
    if(!req.body.hasOwnProperty('totalItems')) {
        return res
        .status(400)
        .send({ status: false, Message: `total Price Should Be Presemt In Request Body` })
    }
    if (!validators.isValidNumber(totalItems)) {
        return res
        .status(400)
        .send({ status: false, Message: `Total items Should Be A Number` })
    }

    totalQuantity = 0 //should be taken from request body
    for(let i = 0 ; i< items.length ; i++) {
        totalQuantity += items[i]['quantity']
    }


    const newOrderData = {

        userId,
        items,
        totalPrice,
        totalItems,
        totalQuantity,
        //cancellable : true,  by default true
        
    }

    const newOrder = await orderModel.create(newOrderData)
    res.status(201).send({ status: true, Message: `Success`, Data : newOrder })

}
module.exports.createOrder = createOrder


const updateOrder = async (req, res) => {
    
}