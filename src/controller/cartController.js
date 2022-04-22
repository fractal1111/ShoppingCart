const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validators')

const createCart = async function (req, res) {
try {

    const userId = req.params.userId.trim()

    if (!validator.isValidObjectId(userId)) {

        return res
            .status(400)
            .send({ status: false, message: "enter a valid userId" })

    }

    const isUserExist = await userModel.findById(userId)

    if (!isUserExist) {

        return res
            .status(404)
            .send({ status: false, message: "user not found" });

    }

        //authorization
    if (userId != req.userId) {

        return res
            .status(403)
            .send({ status: false, message: "User not authorized to create a cart" })
        
    }

    const requestBody = req.body

    if (!validator.isValidRequestBody(requestBody)) {
        return res
            .status(400)
            .send({ status: false, message: "Please provide input" })

    }

    let { cartId, productId } = requestBody

    if ('cartId' in requestBody) {

        if (!validator.isValid(cartId)) {
            return res
                .status(400)
                .send({ status: false, message: `Cart Id Should be a valid string.` })

        }

        cartId = cartId.trim()

        if (!validator.isValidObjectId(cartId)) {
            return res
                .status(400)
                .send({ status: false, message: `invalid Cart Id` })

        }
    }

    if (!validator.isValid(productId)) {
        return res
            .status(400)
            .send({ status: false, message: "enter the productId" });

    }

    productId = productId.trim()

    if (!validator.isValidObjectId(productId)) {
        return res
            .status(400)
            .send({ status: false, msg: "enter a valid productId" })

    }

    const product = await productModel.findOne({ _id: productId, isDeleted: false });

    if (!product) {
        return res
            .status(404)
            .send({ status: false, message: "product not found" })

    }

    if (product.installments === 0) {
        return res
            .status(400)
            .send({ status: false, message: `Product Is Out Of Stock Currently.` })

    }

    let isCartExist = await cartModel.findOne({ userId: userId })

    if (!isCartExist) {

        let newCartData = {

            userId,
            items:
                [
                    {
                        productId: product._id,
                        quantity: 1
                    }
                ],
            totalPrice: product.price,
            totalItems: 1

        }

    const newCart = await cartModel.create(newCartData)
    return res
        .status(201)
        .send({ status: true, message: `Success`, data: newCart })

    }

    if (!req.body.hasOwnProperty('cartId')) {
        return res
            .status(400)
            .send({ status: false, message: `The Cart Is Aleady Present for ${userId} userId,Please Enter  corresponding CartID` })
    }


    if (isCartExist._id != cartId) { 
        return res
        .status(400)
        .send({ Status: false, message: "Cart Id and user do not match" })

    }

    let itemList = isCartExist.items
    let productIdList = itemList.map( (ele) => ele = ele.productId )
    
    if(productIdList.find( (ele) => ele == productId )) {

        const updatedCart = await cartModel.findOneAndUpdate ( { userId: userId , "items.productId" : productId },
        {$inc : {
            totalPrice : + product.price,
            totalItems : +1 ,
            "items.$.quantity" : +1

        } }, {new : true} )

        return res
            .status(200)
            .send({ status: true, data: updatedCart })

    }
    
    const updatedCart = await cartModel.findOneAndUpdate ({ userId },
        {
            $addToSet: { items: { productId : productId, quantity : 1 } },
            $inc : { totalPrice : + product.price , totalItems : +1 }
        }, {new: true })

        return res
            .status(201)
            .send({ status: true, message: `Success`, data: updatedCart })


}catch (err) {
    return res
        .status(500)
        .send({ status: false, message: err.message })
}
}




const updateCart = async (req, res) => {

try {
    let userId = req.params.userId.trim()

    if (!validator.isValidObjectId(userId)) {
        return res
            .status(400)
            .send({ status: false, message: "enter a valid userId" });

    }

    const isUserExist = await userModel.findById(userId)

    if (!isUserExist) {
        return res
            .status(404)
            .send({ status: false, message: "user not found" })

    }

        //authorization
    if (userId != req.userId) { 
        return res
            .status(403)
            .send({ status: false, message: "user not authorized to update cart" })

    }

    const requestBody = req.body;

    if (!validator.isValidRequestBody(requestBody)) {
        return res
            .status(400)
            .send({ status: false, message: `Invalid Request parameters` });

    }

    let {

        cartId,
        productId,
        removeProduct

    } = requestBody

    
    const isCartExist = await cartModel.findOne({ userId: userId })
    if (!isCartExist) {
        return res
        .status(404)
        .send({ status: false, message: `Cart Not Found Please Check Cart Id` })

    }

    if (!validator.isValid(cartId)) {
        return res
            .status(400)
            .send({ status: false, message: `Please Enter A Cart ID` })
    }

    cartId = cartId.trim()

    if (!validator.isValidObjectId(cartId)) {
        return res
            .status(400)
            .send({ status: false, message: `invalid Cart Id` })

    }

    if (isCartExist._id != cartId) {
        return res
        .status(400)
        .send({ status: false, message: "CartId and user do not match" })

    }

    if (!validator.isValid(productId)) {
        return res
            .status(400)
            .send({ status: false, message: "enter the productId" })

    }

    productId = productId.trim()

    if (!validator.isValidObjectId(productId)) {
        return res
            .status(400)
            .send({ status: false, message: "enter a valid productId" });

    }

    const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!isProductExist) {
        return res
        .status(404)
        .send({ status: false, message: `Product Not Exist` })

    }

    if (!req.body.hasOwnProperty('removeProduct')) {
        return res
        .status(400)
        .send({ status: false, message: "removeProduct key Should Be present" })

    }

    
    if (isNaN(removeProduct)) {
        return res
            .status(400)
            .send({ status: false, message: "enter the value for removeProduct" })

    }

    if (!(removeProduct === 1 || removeProduct === 0)) {
        return res
            .status(400)
            .send({ status: false, message: `invalid input - remove Product key Should Be a number 1 or 0` })

    }

    itemList = isCartExist.items

    let idList = itemList.map( (ele) => ele = ele.productId.toString() ) 
    let index = idList.indexOf(productId)

    if(index == -1) {
        return res
        .status(400)
        .send({ status: false, message: `Product Does Not Exist In Cart` })
        
    }

    if (removeProduct == 0 || (removeProduct == 1 && itemList[index]['quantity'] == 1)) {

        let productPrice = itemList[index].quantity * isProductExist.price

        const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
        {
            $pull: { items: { productId: productId } },
            $inc : { totalPrice: -productPrice, totalItems : -itemList[index].quantity }

        }, { new: true })

        return res
            .status(200)
            .send({ status: true, message: 'sucessfully removed product', data: updatedCart })


    }

    if (removeProduct == 1) {
        const updatedCart = await cartModel.findOneAndUpdate({ userId: userId , "items.productId" : productId},
        {
            $inc : { totalPrice: -isProductExist.price, totalItems : -1,
            "items.$.quantity" : -1 }

        }, { new: true })

        return res
            .status(200)
            .send({ status: true, message: 'sucessfully Removed Product', data: updatedCart })
            
    }

}catch (err) {
    return res
        .status(400)
        .send({ status: false, message: err.message })
}
}

module.exports.updateCart = updateCart


const deleteCart = async function (req, res) {

    try {
        let id = req.params.userId.trim()
        if (!validator.isValidObjectId(id)) {
            return res
                .status
                .send({ status: false, message: "Please provide valid Object id" })
        }

        let user = await userModel.findById(id)
        if (!user) {
            return res
                .status(404)
                .send({ status: false, message: "User with this user id does not exist" })
        }

        if (id == req.userId) {


            let isCart = await cartModel.findOne({ userId: id })
            if (!isCart) { return res.status(404).send({ Status: false, message: "No cart exists For this user" }) }
           
           
            if(isCart.items.length ==0){return res.status(400).send({status:false , message:"Can not delete empty cart"})}
            
            
            
            let updatedCart = await cartModel.findOneAndUpdate({ userId: id },
                { $set: { items: [], totalItems: 0, totalPrice: 0 } })


            return res.status(200).send({ status: true, message: "Cart deleted successfuly" })





        } else {
            return res
                .status(403)
                .send({ status: false, message: "User not authorized to delete cart" })
        }
    }
    catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err.message })
    }

}




const getById = async function (req, res) {

    try {
        let id = req.params.userId.trim()
        if (!validator.isValidObjectId(id)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter valid Object Id" })
        }


        let user = await userModel.findById(id)
        if (!user) {
            return res
                .status(404)
                .send({ status: false, message: "User does not exist" })
        }

        //Authorization

        if (id == req.userId) {

            let isCart = await cartModel.findOne({ userId: id }).populate('items.productId')
            if (!isCart) {
                return res
                    .status(404)
                    .send({ status: false, message: "Cart not found" })
            }


            return res
                .status(200)
                .send({ status: true, message: "Successfull", data: isCart })

        } else {
            return res
                .status(403)
                .send({ status: false, message: "User not authorized to view requested cart" })
        }

    }
    catch (err) {
        return res
            .status(400)
            .send({ status: false, message: err.message })
    }

}






module.exports.createCart = createCart
module.exports.getById = getById
module.exports.deleteCart=deleteCart

