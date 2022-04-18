const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validators')

const createCart = async function (req, res) {
    try {

        const userId = req.params.userId;

        if (!validator.isValidObjectId(userId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a valid userId" });
        }

        const isUserExist = await userModel.findById(userId);

        if (!isUserExist) {
            return res
                .status(404)
                .send({ status: false, msg: "user not found" });
        }

//authorization
        if(userId == req.userId){

        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide input" });
        }

        const { cartId, productId } = requestBody;

        if ('cartId' in requestBody) {

            if (!validator.isValidObjectId(cartId)) {
                return res
                    .status(400)
                    .send({ status: false, message: `invalid Cart Id` })
            }
        }

        if (!validator.isValid(productId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter the productId" });
        }

        if (!validator.isValidObjectId(productId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a valid productId" });
        }

        const product = await productModel.findOne({ _id: productId, isDeleted:false });

        if (!product) {
            return res
                .status(404)
                .send({ status: false, msg: "product not found" });
        }

        if (product.installments === 0) {
            return res
                .status(200)
                .send({ status: false, Message: `Product Is Out Of Stock Currently.` })
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
                .send({ status: true, message: `Success`, Data: newCart })
        }

        // if (!req.body.hasOwnProperty('cartId')) { 
        //     return res
        //         .status(404)
        //         .send({ status: false, message: `The Cart Is Aleady Present for ${userId} userId,Please Enter CartID` })
        // }
       
       //cart id in body(if there) should equal cart id in isCartExists other wise user and cart missmatch
        
       
       if (req.body.hasOwnProperty('cartId')){
        if(isCartExist._id != cartId){return res.status(400).send({Status:false , msg:"Cart Id and user do not match"})}
    
    }

        let itemList = isCartExist.items
       
        //if product prexists
       
        for (let i = 0; i < itemList.length; i++) {

            if ( itemList[i].productId == productId ) {

                itemList[i].quantity = itemList[i].quantity + 1
                const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId },
                    {
                        items: itemList,
                        totalPrice: isCartExist.totalPrice + product.price,
                        totalItems: isCartExist.totalItems + 1

                    }, { new: true })

                return res
                    .status(200)
                    .send({ status: true, Data: updatedCart })
            }

        }

       //new product being added to  cart
        const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
            {
                $addToSet: { items: { productId: productId, quantity: 1 } },
                totalPrice: isCartExist.totalPrice + product.price,
                totalItems: isCartExist.totalItems + 1

            }, { new: true })

        return res
            .status(201)
            .send({ status: true, Message: `Success`, Data: updatedCart })

    }else{
        return res 
        .status(403)
        .send({Status:false , msg:"User not authorized to create a cart"})
    }

}
    
    catch (err) {
        return res
            .status(500)
            .send({ Status: false, Message: err.message })
    }
}

module.exports.createCart = createCart


const updateCart = async (req, res) => {

   try{ const userId = req.params.userId

    if (!validator.isValidObjectId(userId)) {
        return res
            .status(400)
            .send({ status: false, msg: "enter a valid userId" });
    }

    const isUserExist = await userModel.findById(userId);

    if (!isUserExist) {
        return res
            .status(404)
            .send({ status: false, msg: "user not found" });
    }
    
    //authorization
    if(userId == req.userId){
    
    
    
    const requestBody = req.body;


    if (!validator.isValidRequestBody(requestBody)) {
        return res
            .status(400)
            .send({ status: false, msg: `Invalid Request parameters` });
    }

    const { cartId, productId, removeProduct } = requestBody;

    const isCartExist = await cartModel.findOne({ userId: userId })
    if (!isCartExist) {
        return res.status(404).send({ status: false, message: `Cart Not Found Please Check Cart Id` })
    }

  
    if ('cartId' in requestBody) {

        if (!validator.isValid(cartId)) {
            return res
                .status(400)
                .send({ status: false, Message: `Please Enter A Cart ID` })
        }

        if (!validator.isValidObjectId(cartId)) {
            return res
                .status(400)
                .send({ status: false, Message: `invalid Cart Id` })
        }

    
    if(isCartExist._id != cartId){return res.status(400).send({Status:false , msg:"CartId and user do not match"})}
    
    
    } else {
        return res
            .status(400)
            .send({ status: false, Message: `CartId Should Be present` })
    }

    // const isCartExist = await cartModel.findOne({ userId: userId })
    // if (!isCartExist) {
    //     return res.status(404).send({ status: false, message: `Cart Not Found Please Check Cart Id` })
    // }

    if (!validator.isValid(productId)) {
        return res
            .status(400)
            .send({ status: false, Message: "enter the productId" });
    }

    if (!validator.isValidObjectId(productId)) {
        return res
            .status(400)
            .send({ status: false, Message: "enter a valid productId" });
    }

    const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!isProductExist) {
        return res.status(404).send({ status: false, Message: `Product Not Exist` })
    }

    if (!req.body.hasOwnProperty('removeProduct')) {
        return res.status(400).send({ status: false, message: "removeProduct key Should Be present" })
    }

    if (!(removeProduct == 1 || removeProduct == 0)) {
        return res
            .status(400)
            .send({ status: false, message: `invalid input - remove Product key Should Be a number 1 or 0` })
    }

    itemList = isCartExist.items

    for (let i = 0; i < itemList.length; i++) {

        if ( itemList[i].productId == productId ) {
            let productPrice = itemList[i].quantity * isProductExist.price

            if (removeProduct == 0) {
                const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
                    {
                        $pull: { items: { productId: productId } },
                        totalPrice: isCartExist.totalPrice - productPrice,
                        totalItems: isCartExist.totalItems - itemList[i].quantity

                    }, { new: true }
                )
                return res
                    .status(200)
                    .send({ status: true, msg: 'sucessfully removed product', Data: updatedCart })
            }

            if(removeProduct == 1 && itemList[i].quantity == 1) {

                const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
                    {
                        $pull: { items: { productId: productId } },
                        totalPrice: isCartExist.totalPrice - productPrice,
                        totalItems: isCartExist.totalItems - itemList[i].quantity

                    }, { new: true }
                )
                return res
                    .status(200)
                    .send({ status: true, msg: 'sucessfully removed product', Data: updatedCart })

            }

            if (removeProduct == 1) {
                itemList[i].quantity = itemList[i].quantity - 1
                const updatedCart = await cartModel.findOneAndUpdate({ userId : userId },
                    { 
                        items: itemList, totalPrice: isCartExist.totalPrice - isProductExist.price,
                        totalItems : isCartExist.totalItems - 1

                    }, {new : true})

                return res
                .status(200)
                .send({ status: true, msg: 'sucessfully removed product quantity', Data: updatedCart })
            }

        }else {
            return res
            .status(400)
            .send({ status: false, Message: `Item Does Not Exist In cart` })
        }
    }

}else{
    return res
    .status(400)
    .send({Status:false , msg:"user not authorized to update cart"})}



}

catch(err){
    return res
    .status(400)
    .send({Status:false , msg:err.message})}


}

module.exports.updateCart = updateCart


const deleteCart = async function (req, res) {

    try {
        let id = req.params.userId
        if (!validator.isValidObjectId(id)) {
            return res
                .status
                .send({ Status: false, msg: "Please provide valid Object id" })
        }

        let user = await userModel.findById(id)
        if (!user) {
            return res
                .status(404)
                .send({ Status: false, msg: "User with this user id does not exist" })
        }

      if(id == req.userId){
      
      
        let isCart = await cartModel.findOne({ userId: id })
        if (!isCart) { return res.status(404).send({ Status: false, msg: "No cart exists For this user" }) }

        let updatedCart = await cartModel.findOneAndUpdate({ userId: id },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } })


        return res.status(200).send({ Status: true, msg: "Cart deleted successfuly" })





    }else {
        return res 
        .status(403)
        .send({Status:false , msg:"User not authorized to delete cart"})
    }
}
    catch (err) {
        return res
            .status(500)
            .send({ Status: false, msg: err.msg })
    }

}

module.exports.deleteCart = deleteCart


const getById = async function (req, res) {

    try {
        let id = req.params.userId
        if (!validator.isValidObjectId(id)) {
            return res
                .status(400)
                .send({ Status: false, msg: "Please enter valid Object Id" })
        }


let user = await userModel.findById(id)
if(!user){
    return res
    .status(404)
    .send({Status:false , msg:"User does not exist"})
}

        //Authorization

        if(id == req.userId){
       
            let isCart = await cartModel.findOne({ userId: id }).populate('items.productId')
        if (!isCart) {
            return res
                .status(404)
                .send({ Status: false, msg: "Cart not found" })
        }


        return res
            .status(200)
            .send({ Status: true, msg: "Successfull", Data: isCart })






    }else{
        return res
        .status(403)
        .send({Status:false , msg:"User not authorized to view requested cart"})}

}
    catch (err) {
        return res
            .status(400)
            .send({ Status: false, msg: err.message })
    }

}
module.exports.getById = getById